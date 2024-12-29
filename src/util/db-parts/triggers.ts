import { database } from "../database";

const _actions = {
  getFor: async (userId: string): Promise<UserImposition[]> => {
    return await database.all<UserImposition[]>(
      "SELECT * FROM user_imposition WHERE user_id = ?;",
      userId
    );
  },

  getRandomByTagFor: async (
    userId: string,
    tags: string[]
  ): Promise<UserImposition | null> => {
    const impositions = (await _actions.getFor(userId)).filter((x) =>
      x.tags.split(";").some((y) => y === "anywhere" || tags.includes(y))
    );
    if (impositions.length === 0) return null;
    return impositions[Math.floor(Math.random() * impositions.length)];
  },
} as const;

export default _actions;
