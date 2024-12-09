import { database } from "../database";

export async function getSpirals(): Promise<Spiral[]> {
  return (await database.all(`SELECT * FROM spirals;`)) as Spiral[];
}

export async function getSpiralById(id: number): Promise<Spiral> {
  return (
    await database.all(`SELECT * FROM spirals WHERE id = (?);`, id)
  )[0] as Spiral;
}

export async function getSpiralByLink(link: string): Promise<Spiral> {
  return (
    await database.all(`SELECT * FROM spirals WHERE link = (?);`, link)
  )[0] as Spiral;
}

export async function getRandomSpiral(): Promise<Spiral> {
  const spiral = (await database.get(
    `SELECT * FROM spirals ORDER BY RANDOM() LIMIT 1;`
  )) as Spiral;
  spiral.link = spiral.link.replace(/[<>]/g, "");
  return spiral;
}

export async function addSpiral(
  link: string,
  author: string,
  fileName: string
): Promise<Spiral> {
  return await database.get<Spiral>(
    `INSERT INTO spirals (link, sent_by, file_name) VALUES (?, ?, ?) RETURNING *;`,
    link,
    author,
    fileName
  );
}

export async function deleteSpiral(id: number): Promise<void> {
  await database.run(`DELETE FROM spirals WHERE id = (?);`, id);
}

export async function hasSpiral(link: string): Promise<boolean> {
  return (
    (await database.all(`SELECT * FROM spirals WHERE link = (?);`, link))
      .length !== 0
  );
}
