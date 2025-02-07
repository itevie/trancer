import { database } from "../database";

const _actions = {
  create: async (giveaway: Giveaway): Promise<Giveaway> => {
    return await database.get<Giveaway>(
      "INSERT INTO giveaways (id, what, message_id, channel_id, author_id, min_level) VALUES (?, ?, ?, ?, ?, ?) RETURNING *",
      giveaway.id,
      giveaway.what,
      giveaway.message_id,
      giveaway.channel_id,
      giveaway.author_id,
      giveaway.min_level
    );
  },

  get: async (id: string): Promise<Giveaway | null> => {
    return await database.get<Giveaway>(
      "SELECT * FROM giveaways WHERE id = ?",
      id
    );
  },

  delete: async (id: string): Promise<void> => {
    await database.run(
      "DELETE FROM giveaway_entries WHERE giveaway_id = ?",
      id
    );
    await database.run("DELETE FROM giveaways WHERE id = ?", id);
  },

  entries: {
    getFor: async (id: string): Promise<GiveawayEntry[]> => {
      return await database.all<GiveawayEntry[]>(
        "SELECT * FROM giveaway_entries WHERE giveaway_id = ?",
        id
      );
    },

    addFor: async (id: string, author_id: string): Promise<void> => {
      await database.run(
        "INSERT INTO giveaway_entries (giveaway_id, author_id) VALUES (?, ?);",
        id,
        author_id
      );
    },
  },
} as const;

export default _actions;
