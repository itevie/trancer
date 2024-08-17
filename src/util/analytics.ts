import sqlite3, { Statement } from "sqlite3"
import { Database, open } from "sqlite"
import * as path from "path";
import * as fs from "fs";
import config from "../config";
import Logger from "./Logger";

export let analyticDatabase: Database<sqlite3.Database, Statement>;
export const analyticDatabaseLogger = new Logger("analytic-database");

export async function connectAnalytic(): Promise<void> {
    if (!config.analytics.enabled) return;

    // This is relative to the config file
    const databasePath = path.join(config.analytics.location);

    // Create database
    analyticDatabase = await open({
        filename: databasePath,
        driver: sqlite3.Database
    });

    // Setup
    await analyticDatabase.exec(
        fs.readFileSync(path.join(__dirname + "/../sql/analytics.sql"), "utf-8")
    );

    analyticDatabaseLogger.log("Database successfully opened");
}

// ----- Analytical SQL Functions -----
export async function addMoneyTransaction(userId: string, balance: number): Promise<void> {
    if (!config.analytics.enabled) return;
    await analyticDatabase.run(`INSERT INTO money_transactions (user_id, balance, added_at) VALUES (?, ?, ?)`, userId, balance, Date.now());
    return;
}

export async function getMoneyTransations(userId: string): Promise<MoneyTransaction[]> {
    if (!config.analytics.enabled) return [];
    return await analyticDatabase.all(`SELECT * FROM money_transactions WHERE user_id = ?`, userId) as MoneyTransaction[];
}

export async function getAllMoneyTransations(): Promise<MoneyTransaction[]> {
    if (!config.analytics.enabled) return [];
    return await analyticDatabase.all(`SELECT * FROM money_transactions `) as MoneyTransaction[];
}