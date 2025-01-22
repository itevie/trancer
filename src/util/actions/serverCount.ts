import { database } from "../database";

export async function getServerCount(serverId: string): Promise<ServerCount | null> {
    return (await database.all(`SELECT * FROM server_count WHERE server_id = ?;`, serverId))[0] as ServerCount;
}