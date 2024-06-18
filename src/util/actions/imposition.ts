import { database } from "../database";

export async function channelHasImposition(channelId: string): Promise<boolean> {
    return (await database.all(`SELECT * FROM channel_imposition WHERE channel_id = (?)`, channelId)).length !== 0;
}

export async function setupImposition(channelId: string): Promise<void> {
    if (!(await channelHasImposition(channelId)))
        await database.run(`INSERT INTO channel_imposition (channel_id) VALUES (?)`, channelId);
}

export async function impositionSetEnabled(channelId: string, newValue: boolean): Promise<void> {
    await database.run(`UPDATE channel_imposition SET is_enabled = (?) WHERE channel_id = (?);`, newValue, channelId);
}

export async function setImpositionChance(channelId: string, newValue: number): Promise<void> {
    await database.run(`UPDATE channel_imposition SET chance = (?) WHERE channel_id = (?);`, newValue, channelId);
}

export async function setImpositionEvery(channelId: string, newValue: number): Promise<void> {
    await database.run(`UPDATE channel_imposition SET every = (?) WHERE channel_id = (?);`, newValue, channelId);
}

export async function getImposition(channelId: string): Promise<ChannelImposition | undefined> {
    return await database.get(`SELECT * FROM channel_imposition WHERE channel_id = (?);`, channelId);
}

// ----- User Specific -----
export async function addImpositionFor(userId: string, what: string, isBombard: boolean): Promise<void> {
    await database.run(`INSERT INTO user_imposition (user_id, what, is_bombardable) VALUES ((?), (?), (?))`, userId, what, isBombard);
}

export async function getImpositionFor(userId: string): Promise<UserImposition[]> {
    return await database.all(`SELECT * FROM user_imposition WHERE user_id = (?)`, userId);
}