import { database } from "../database";

export async function getDawnagotchi(userId: string): Promise<Dawnagotchi | undefined> {
    // Fetch the thign
    let result = await database.get(`SELECT * FROM dawnagotchi WHERE owner_id = ? AND alive = true`, userId) as Dawnagotchi | undefined;
    if (!result) return undefined;

    // Validify dates
    result.next_drink = new Date(result.next_drink);
    result.next_feed = new Date(result.next_feed);
    result.next_play = new Date(result.next_play);
    result.created_at = new Date(result.created_at);

    return result;
}

export async function setupDawnagotchi(userId: string): Promise<Dawnagotchi> {
    return await database.get(
        `INSERT INTO dawnagotchi (owner_id, next_feed, next_drink, next_play) VALUES (?, ?, ?, ?) RETURNING *;`,
        userId, Date.now(), Date.now(), Date.now()
    ) as Dawnagotchi;
}

export async function removeDawnagotchi(userId: string): Promise<void> {
    await database.run(`UPDATE dawnagotchi SET alive = false WHERE owner_id = ?`, userId);
}