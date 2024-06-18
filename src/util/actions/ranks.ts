import { database } from "../database";

export async function rankExists(name: string): Promise<boolean> {
    return (await database.all(`SELECT * FROM ranks WHERE rank_name = (?)`, name)).length !== 0;
}