import sqlite3, { Statement } from "sqlite3"
import { Database, open } from "sqlite"
import * as path from "path";
import * as fs from "fs";
import config from "../config.json";

export let database: Database<sqlite3.Database, Statement>;

export async function connect(): Promise<void> {
    // This is relative to the config file
    const databasePath = path.join(__dirname, "/../", config.database.location);

    // Create database
    database = await open({
        filename: databasePath,
        driver: sqlite3.Database
    });

    // Setup
    await database.exec(
        fs.readFileSync(path.join(__dirname + "/../sql/setup.sql"), "utf-8")
    );

    console.log("Database successfully opened");
}