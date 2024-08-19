import { addMoneyTransaction } from "../analytics";
import { database } from "../database";

export type moneyAddReasons = "gambling" | "commands" | "messaging" | "vc" | "helping";

export async function economyForUserExists(userId: string): Promise<boolean> {
    return (await database.all(`SELECT * FROM economy WHERE user_id = (?)`, userId)).length !== 0;
}

export async function createEconomyFor(userId: string): Promise<Economy> {
    return await database.get(`INSERT INTO economy (user_id) VALUES ((?)) RETURNING *`, userId);
}

export async function getEconomyFor(userId: string): Promise<Economy> {
    let result = (await database.all(`SELECT * FROM economy WHERE user_id = (?);`, userId))[0] as Economy | undefined;
    if (!result) result = await createEconomyFor(userId);
    return result;
}

export async function getAllEconomy(): Promise<Economy[]> {
    return (await database.all(`SELECT * FROM economy`)) as Economy[];
}

export async function addMoneyFor(userId: string, amount: number, reason?: moneyAddReasons): Promise<void> {
    let eco = await database.get(`UPDATE economy SET balance = balance + ? WHERE user_id = ? RETURNING *`, amount, userId) as Economy;
    if (reason) {
        await database.run(`UPDATE economy SET from_${reason} = from_${reason} + ? WHERE user_id = ?`, amount, userId);
    }

    await addMoneyTransaction(userId, eco.balance);
}

export async function removeMoneyFor(userId: string, amount: number, gamblingRelated?: boolean): Promise<void> {
    let eco = await database.get(`UPDATE economy SET balance = balance - (?) WHERE user_id = (?) RETURNING *`, amount, userId) as Economy;
    if (gamblingRelated) {
        await database.run(`UPDATE economy SET from_gambling_lost = from_gambling_lost + ? WHERE user_id = ?`, amount, userId);
    }

    await addMoneyTransaction(userId, eco.balance);
}

export async function setMoneyFor(userId: string, amount: number): Promise<void> {
    let eco = await database.get(`UPDATE economy SET balance = (?) WHERE user_id = (?) RETURNING *`, amount, userId) as Economy;
    await addMoneyTransaction(userId, eco.balance);
}

export async function setLastFish(userId: string): Promise<void> {
    await database.run(`UPDATE economy SET last_fish = (?) WHERE user_id = (?)`, Date.now(), userId);
}

export async function setLastDaily(userId: string): Promise<void> {
    await database.run(`UPDATE economy SET last_daily = (?) WHERE user_id = (?)`, Date.now(), userId);
}