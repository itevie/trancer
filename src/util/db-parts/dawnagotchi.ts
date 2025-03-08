import { database } from "../database";

const _actions = {
  getFor: async (userId: string): Promise<Dawnagotchi | undefined> => {
    let result = (await database.get(
      `SELECT * FROM dawnagotchi WHERE owner_id = ? AND alive = true`,
      userId
    )) as Dawnagotchi | undefined;
    if (!result) return undefined;

    result.next_drink = new Date(result.next_drink);
    result.next_feed = new Date(result.next_feed);
    result.next_play = new Date(result.next_play);
    result.created_at = new Date(result.created_at);

    return result;
  },

  setupFor: async (userId: string): Promise<Dawnagotchi> => {
    return await database.get<Dawnagotchi>(
      `INSERT INTO dawnagotchi (owner_id, next_feed, next_drink, next_play) VALUES (?, ?, ?, ?) RETURNING *;`,
      userId,
      Date.now(),
      Date.now(),
      Date.now()
    );
  },

  removeFor: async (userId: string): Promise<void> => {
    await database.run(
      `UPDATE dawnagotchi SET alive = false WHERE owner_id = ?`,
      userId
    );
  },
} as const;

export default _actions;
