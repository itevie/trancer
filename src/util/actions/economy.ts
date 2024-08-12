import { database } from "../database";

export async function economyForUserExists(userId: string): Promise<boolean> {
    return (await database.all(`SELECT * FROM economy WHERE user_id = (?)`, userId)).length !== 0;
}

export async function createEconomyFor(userId: string): Promise<void> {
    await database.run(`INSERT INTO economy (user_id) VALUES ((?))`, userId);
}

export async function getEconomyFor(userId: string): Promise<Economy> {
    return (await database.all(`SELECT * FROM economy WHERE user_id = (?);`, userId))[0] as Economy;
}

export async function getAllEconomy(): Promise<Economy[]> {
    return (await database.all(`SELECT * FROM economy`)) as Economy[];
}

export async function addMoneyFor(userId: string, amount: number): Promise<void> {
    await database.run(`UPDATE economy SET balance = balance + (?) WHERE user_id = (?)`, amount, userId);
}

export async function removeMoneyFor(userId: string, amount: number): Promise<void> {
    await database.run(`UPDATE economy SET balance = balance - (?) WHERE user_id = (?)`, amount, userId);
}

export async function setLastFish(userId: string): Promise<void> {
    await database.run(`UPDATE economy SET last_fish = (?) WHERE user_id = (?)`, Date.now(), userId);
}

export async function setLastDaily(userId: string): Promise<void> {
    await database.run(`UPDATE economy SET last_daily = (?) WHERE user_id = (?)`, Date.now(), userId);
}