import { database } from "../database";

export async function getSpirals(): Promise<Spiral[]> {
    return await database.all(`SELECT * FROM spirals;`) as Spiral[];
}

export async function getRandomSpiral(): Promise<Spiral> {
    const spiral = await database.get(`SELECT * FROM spirals ORDER BY RANDOM() LIMIT 1;`) as Spiral;
    spiral.link = spiral.link.replace(/[<>]/g, "");
    return spiral;
}

export async function addSpiral(link: string, author: string, fileName: string): Promise<void> {
    await database.run(`INSERT INTO spirals (link, sent_by, file_name) VALUES (?, ?, ?)`, link, author, fileName);
}

export async function deleteSpiral(link: string): Promise<void> {
    await database.run(`DELETE FROM spirals WHERE link = (?);`, link);
}

export async function hasSpiral(link: string): Promise<boolean> {
    return (await database.all(`SELECT * FROM spirals WHERE link = (?);`, link)).length !== 0;
}