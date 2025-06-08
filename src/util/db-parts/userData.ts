import { database } from "../database";

type UserDataUpdate = Omit<UserData, "guild_id" | "user_id">;

const _actions = {
  getFor: async (userId: string, serverId: string): Promise<UserData> => {
    return (
      (await database.get<UserData>(
        "SELECT * FROM user_data WHERE user_id = ? AND guild_id = ?;",
        userId,
        serverId,
      )) ?? (await _actions.createFor(userId, serverId))
    );
  },

  async getCollective(userId: string): Promise<Partial<UserData>> {
    const all = await database.all<UserData[]>(
      "SELECT * FROM user_data WHERE user_id = ?",
      userId,
    );
    const data: Partial<UserData> = {
      ttt_win: 0,
    };

    for (const a of all) {
      for (const key of Object.keys(data))
        if (typeof data[key] === "number") data[key] += a[key];
    }

    return data;
  },

  getForServer: async (serverId: string): Promise<UserData[]> => {
    return await database.all<UserData[]>(
      "SELECT * FROM user_data WHERE guild_id = ?;",
      serverId,
    );
  },

  createFor: async (userId: string, serverId: string): Promise<UserData> => {
    return await database.get<UserData>(
      `INSERT INTO user_data (user_id, guild_id) VALUES (?, ?) RETURNING *;`,
      userId,
      serverId,
    );
  },

  // ----- Update Functions -----

  incrementFor: async (
    userId: string,
    serverId: string,
    key: "bumps" | "messages_sent" | "xp",
    by: number = 1,
  ): Promise<UserData> => {
    return await database.get<UserData>(
      `UPDATE user_data SET ${key} = ${key} + ? WHERE user_id = ? AND guild_id = ?`,
      by,
      userId,
      serverId,
    );
  },

  updateFor: async <T extends keyof UserDataUpdate>(
    userId: string,
    serverId: string,
    key: T,
    value: UserDataUpdate[T],
  ): Promise<UserData> => {
    return await database.get(
      `UPDATE user_data SET ${key} = ?
        WHERE user_id = ? AND guild_id = ?;`,
      value,
      userId,
      serverId,
    );
  },
} as const;

export default _actions;
