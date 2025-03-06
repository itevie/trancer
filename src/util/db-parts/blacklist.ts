import { database } from "../database";

const _actions = {
  setFor: async (
    type: BlacklistType,
    server_id: string,
    key: string,
    state: boolean
  ) => {
    if (!state) {
      await database.run(
        "DELETE FROM blacklisted WHERE server_id = ? AND type = ? AND key = ?",
        server_id,
        type,
        key
      );
    } else {
      if (
        await database.get(
          "SELECT * FROM blacklisted WHERE server_id = ? AND type = ? AND key = ?",
          server_id,
          type,
          key
        )
      )
        return;
      await database.run(
        "INSERT INTO blacklisted (server_id, type, key) VALUES (?, ?, ?)",
        server_id,
        type,
        key
      );
    }
  },

  getFor: async (type: BlacklistType, server_id: string, key: string) => {
    return await database.get(
      "SELECT * FROM blacklisted WHERE server_id = ? AND type = ? AND key = ?",
      server_id,
      type,
      key
    );
  },
} as const;

export default _actions;
