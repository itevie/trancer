import sqlite3, { Statement } from "sqlite3";
import { Database, open } from "sqlite";
import * as path from "path";
import * as fs from "fs";
import config from "../config";
import Logger from "./Logger";
import { formatDate } from "./other";

export let analyticDatabase: Database<sqlite3.Database, Statement>;
export const analyticDatabaseLogger = new Logger("analytic-database");

export async function connectAnalytic(): Promise<void> {
  if (!config.analytics.enabled) return;

  // This is relative to the config file
  const databasePath = path.join(config.analytics.location);

  try {
    // Create database
    analyticDatabase = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    // Setup
    await analyticDatabase.exec(
      fs.readFileSync(path.join(__dirname + "/../sql/analytics.sql"), "utf-8")
    );
  } catch (e) {
    console.error(e);
    console.log(
      `Failed to load analytics database, but it is enabled in config.`
    );
    process.exit();
  }

  analyticDatabaseLogger.log("Database successfully opened");
}

// ----- Analytical SQL Functions -----
export async function addMoneyTransaction(
  userId: string,
  balance: number
): Promise<void> {
  if (!config.analytics.enabled) return;
  await analyticDatabase.run(
    `INSERT INTO money_transactions (user_id, balance, added_at) VALUES (?, ?, ?)`,
    userId,
    balance,
    Date.now()
  );
  return;
}

export async function getMoneyTransations(
  userId: string
): Promise<MoneyTransaction[]> {
  if (!config.analytics.enabled) return [];
  return (await analyticDatabase.all(
    `SELECT * FROM money_transactions WHERE user_id = ?`,
    userId
  )) as MoneyTransaction[];
}

export async function getAllMoneyTransations(
  limit?: number
): Promise<MoneyTransaction[]> {
  if (!config.analytics.enabled) return [];
  return (await analyticDatabase.all(
    `SELECT * FROM money_transactions ORDER BY added_at DESC LIMIt ?`,
    limit || 1_000_000
  )) as MoneyTransaction[];
}

export async function addCommandUsage(name: string): Promise<void> {
  if (!config.analytics.enabled) return;
  if (
    !(await analyticDatabase.get(
      `SELECT * FROM command_usage WHERE command_name = ?`,
      name
    ))
  ) {
    await analyticDatabase.run(
      `INSERT INTO command_usage (command_name) VALUES (?)`,
      name
    );
  }
  await analyticDatabase.run(
    `UPDATE command_usage SET used = used + 1 WHERE command_name = ?`,
    name
  );
}

export async function getAllCommandUsage(): Promise<CommandUsage[]> {
  if (!config.analytics.enabled) return [];
  return (await analyticDatabase.all(
    `SELECT * FROM command_usage `
  )) as CommandUsage[];
}

export async function addMessageForCurrentTime(): Promise<void> {
  if (!config.analytics.enabled) return;

  let date = formatDate(new Date());

  try {
    if (
      !(await analyticDatabase.get(
        `SELECT * FROM messages_at_time WHERE time = ?`,
        date
      ))
    ) {
      await analyticDatabase.run(
        `INSERT INTO messages_at_time (time) VALUES (?)`,
        date
      );
    }
    await analyticDatabase.run(
      `UPDATE messages_at_time SET amount = amount + 1 WHERE time = ?`,
      date
    );
  } catch {}
}

export async function getMessageAtTimes(): Promise<MessagesAtTime[]> {
  if (!config.analytics.enabled) return [];
  return await analyticDatabase.all(`SELECT * FROM messages_at_time;`);
}

export async function addToMemberCount(
  serverId: string,
  count: number
): Promise<void> {
  if (!config.analytics.enabled) return;
  await analyticDatabase.run(
    `INSERT INTO member_count (time, server_id, amount) VALUES (?, ?, ?);`,
    formatDate(new Date()),
    serverId,
    count
  );
}

export async function getMemberCounts(
  serverId: string
): Promise<MemberCount[]> {
  return await analyticDatabase.all(
    `SELECT * FROM member_count WHERE server_id = ?;`,
    serverId
  );
}
