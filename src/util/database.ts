import sqlite3, { Statement } from "sqlite3";
import { Database, open } from "sqlite";
import * as path from "path";
import * as fs from "fs";
import config from "../config";
import Logger from "./Logger";

import userData from "./db-parts/userData";
import spirals from "./db-parts/spirals";
import serverSettings from "./db-parts/serverSettings";
import items from "./db-parts/items";

export let database: Database<sqlite3.Database, Statement>;
export const databaseLogger = new Logger("database");

export const actions = {
  userData,
  spirals,
  serverSettings,
  items,
} as const;

export async function connect(): Promise<void> {
  // This is relative to the config file
  const databasePath = path.join(config.database.location);

  try {
    // Create database
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    // Setup
    await database.exec(
      fs.readFileSync(path.join(__dirname + "/../sql/setup.sql"), "utf-8")
    );

    // Init
    for await (const action of Object.values(actions)) {
      // @ts-ignore
      if ("_init" in action) await action._init();
    }
  } catch (e) {
    console.error(e);
    console.log(`Failed to load database.`);
    process.exit();
  }

  databaseLogger.log("Database successfully opened");
}
