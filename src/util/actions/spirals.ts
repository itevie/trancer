import { database } from "../database";

export async function getSpirals(): Promise<Spiral[]> {
    return await database.all(`SELECT * FROM spirals;`) as Spiral[];
}

export async function getRandomSpiral(): Promise<Spiral> {
    return await database.get(`SELECT * FROM spirals ORDER BY RANDOM() LIMIT 1;`) as Spiral;
}

export async function addSpiral(link: string, author: string): Promise<void> {
    await database.run(`INSERT INTO spirals (link, sent_by) VALUES (?, ?)`, link, author);
}

export async function deleteSpiral(link: string): Promise<void> {
    await database.run(`DELETE FROM spirals WHERE link = (?);`, link);
}

export async function hasSpiral(link: string): Promise<boolean> {
    return (await database.all(`SELECT * FROM spirals WHERE link = (?);`, link)).length !== 0;
}