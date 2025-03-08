import { database } from "../database";

const _actions = {
  set: async (
    userId: string,
    commandName: string,
    date: Date
  ): Promise<void> => {
    await database.run(
      `INSERT INTO ratelimits (user_id, command, last_used)
      VALUES (?, ?, ?)
      ON CONFLICT (user_id, command)
      DO UPDATE SET last_used = ?`,
      userId,
      commandName,
      date.toISOString(),
      date.toISOString()
    );
  },

  get: async (userId: string, commandName: string): Promise<Date> => {
    let result = await database.get<Ratelimit>(
      "SELECT * FROM ratelimits WHERE user_id = ? AND command = ?;",
      userId,
      commandName
    );
    return result ? new Date(result.last_used) : new Date(0);
  },
} as const;

export default _actions;
