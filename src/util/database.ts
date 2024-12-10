import sqlite3, { Statement } from "sqlite3";
import { Database, open } from "sqlite";
import * as path from "path";
import * as fs from "fs";
import config from "../config";
import Logger from "./Logger";

export let database: Database<sqlite3.Database, Statement>;
export const databaseLogger = new Logger("database");

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
  } catch (e) {
    console.error(e);
    console.log(`Failed to load database.`);
    process.exit();
  }

  databaseLogger.log("Database successfully opened");
}
