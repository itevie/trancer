import { database } from "../database";
import { getRandomImpositionFromFile } from "../other";

type TriggerTag =
  | "green"
  | "red"
  | "yellow"
  | "by others"
  | "anytime"
  | "bombard";

export const tagEmojiMap: Record<TriggerTag, string> = {
  green: "🟢",
  red: "🔴",
  yellow: "🟡",
  bombard: "🔫",
  "by others": "🧑",
  anytime: "🕓",
};

const _actions = {
  getFor: async (userId: string): Promise<UserImposition[]> => {
    return await database.all<UserImposition[]>(
      "SELECT * FROM user_imposition WHERE user_id = ?;",
      userId
    );
  },

  getList: async (
    userId: string,
    tags: (TriggerTag | null)[]
  ): Promise<UserImposition[]> => {
    tags = tags.filter((x) => !!x);
    return (await _actions.getFor(userId)).filter((x) =>
      (x.tags.split(";") as TriggerTag[]).some(
        (y) => y === "anytime" || tags.includes(y)
      )
    );
  },

  getRandomByTagFor: async (
    userId: string,
    tags: (TriggerTag | null)[],
    useRandom = false
  ): Promise<UserImposition | null> => {
    const impositions = await _actions.getList(userId, tags);
    if (impositions.length === 0)
      return useRandom
        ? {
            user_id: "0",
            what: getRandomImpositionFromFile(),
            is_bombardable: true,
            tags: "anywhere,by others",
          }
        : null;
    return impositions[Math.floor(Math.random() * impositions.length)];
  },
} as const;

export default _actions;
