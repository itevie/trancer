import { database } from "../database";

export async function setupSettingsFor(serverId: string): Promise<void> {
    await database.run(`INSERT INTO server_settings (server_id) VALUES (?)`, serverId);
}

export async function getServerSettings(serverId: string): Promise<ServerSettings> {
    return await database.get(`SELECT * FROM server_settings WHERE server_id = (?);`, serverId) as ServerSettings;
}

export async function setServerPrefix(serverId: string, newPrefix: string): Promise<void> {
    await database.run(`UPDATE server_settings SET prefix = (?) WHERE server_id = (?);`, newPrefix, serverId);
}