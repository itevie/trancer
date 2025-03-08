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
  getAllFor: async (userId: string): Promise<UserImposition[]> => {
    return (
      await database.all<UserImposition[]>(
        "SELECT * FROM user_imposition WHERE user_id = ?;",
        userId
      )
    ).filter((x) => !x.what.includes("@"));
  },

  addFor: async (
    userId: string,
    what: string,
    isBombard: boolean
  ): Promise<void> => {
    await database.run(
      `INSERT INTO user_imposition (user_id, what, is_bombardable) VALUES ((?), (?), (?))`,
      userId,
      what,
      isBombard
    );
  },

  getList: async (
    userId: string,
    tags: (TriggerTag | null)[]
  ): Promise<UserImposition[]> => {
    tags = tags.filter((x) => !!x);
    return (await _actions.getAllFor(userId)).filter(
      (x) =>
        (x.tags.split(";") as TriggerTag[]).some(
          (y) => y === "anytime" || tags.includes(y)
        ) && !x.what.includes("@")
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

  trustedTists: {
    addFor: async (
      userId: string,
      recipient: string
    ): Promise<UserTrustedTist> => {
      return await database.get<UserTrustedTist>(
        "INSERT INTO user_trusted_tists (user_id, trusted_user_id) VALUES (?, ?) RETURNING *",
        userId,
        recipient
      );
    },

    removeFor: async (userId: string, recipient: string): Promise<void> => {
      await database.get(
        "DELETE FROM user_trusted_tists WHERE user_id = ? AND trusted_user_id = ?",
        userId,
        recipient
      );
    },

    getListFor: async (userId: string): Promise<UserTrustedTist[]> => {
      return await database.all<UserTrustedTist[]>(
        "SELECT * FROM user_trusted_tists WHERE user_id = $1",
        userId
      );
    },
  },

  auto: {
    channelHas: async (channelId: string): Promise<boolean> => {
      return (
        (
          await database.all(
            `SELECT * FROM channel_imposition WHERE channel_id = (?)`,
            channelId
          )
        ).length !== 0
      );
    },

    setup: async (channelId: string): Promise<void> => {
      if (!(await _actions.auto.channelHas(channelId)))
        await database.run(
          `INSERT INTO channel_imposition (channel_id) VALUES (?)`,
          channelId
        );
    },

    setEnabled: async (channelId: string, newValue: boolean): Promise<void> => {
      await database.run(
        `UPDATE channel_imposition SET is_enabled = (?) WHERE channel_id = (?);`,
        newValue,
        channelId
      );
    },

    setChance: async (channelId: string, newValue: number): Promise<void> => {
      await database.run(
        `UPDATE channel_imposition SET chance = (?) WHERE channel_id = (?);`,
        newValue,
        channelId
      );
    },

    setEvery: async (channelId: string, newValue: number): Promise<void> => {
      await database.run(
        `UPDATE channel_imposition SET every = (?) WHERE channel_id = (?);`,
        newValue,
        channelId
      );
    },

    getFor: async (
      channelId: string
    ): Promise<ChannelImposition | undefined> => {
      return await database.get(
        `SELECT * FROM channel_imposition WHERE channel_id = (?);`,
        channelId
      );
    },
  },
} as const;

export default _actions;
