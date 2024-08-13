import { database } from "../database";

export async function getItem(id: number): Promise<Item | undefined> {
    return await database.get(`SELECT * FROM items WHERE id = ?`, id);
}

export async function getItemByName(name: string): Promise<Item | undefined> {
    return await database.get(`SELECT * FROM items WHERE name = ?`, name);
}

export async function getAquiredItem(id: number, userId: string): Promise<Aquireditem> {
    let result = await database.get(`SELECT * FROM aquired_items WHERE item_id = ? AND user_id = ?;`, id, userId);
    if (!result)
        result = await database.get(`INSERT INTO aquired_items (item_id, user_id) VALUES (?, ?) RETURNING *`, id, userId);
    return result;
}

export async function getAquiredItemsFor(userId: string): Promise<Aquireditem[]> {
    return await database.all(`SELECT * FROM aquired_items WHERE user_id = ? AND amount > 0`, userId);
}

export async function addItemFor(userId: string, id: number, amount: number = 1): Promise<void> {
    await getAquiredItem(id, userId);
    await database.run(`UPDATE aquired_items SET amount = amount + ? WHERE user_id = ? AND item_id = ?`, amount, userId, id);
}

export async function removeItemFor(userId: string, id: number): Promise<void> {
    await getAquiredItem(id, userId);
    await database.run(`UPDATE aquired_items SET amount = amount - 1 WHERE user_id = ? AND item_id = ?`, userId, id);
}