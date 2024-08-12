import { database } from "../database";

export async function getUserFavouriteSpirals(userId: string): Promise<Spiral[]> {
    return await database.all(`
        SELECT s.*
        FROM spirals s
        INNER JOIN user_favourite_spirals f
        ON s.id = f.id
        WHERE f.user_id = (?);    
    `, userId) as Spiral[];
}

export async function addFavouriteSpiral(userId: string, id: number): Promise<void> {
    await database.run(`INSERT INTO user_favourite_spirals (id, user_id) VALUES ((?), (?));`, id, userId);
}

export async function removeFavouriteSpiral(userId: string, id: number): Promise<void> {
    await database.run(`DELETE FROM user_favourite_spirals WHERE id = (?) AND user_id = (?);`, id, userId);
}