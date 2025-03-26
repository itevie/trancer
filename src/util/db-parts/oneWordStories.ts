import { database } from "../database";

const _actions = {
  getCurrentFor: async (guildId: string): Promise<OneWordStory> => {
    return (
      (await database.get<OneWordStory | null>(
        "SELECT * FROM one_word_stories WHERE guild_id = ? AND done = false",
        guildId,
      )) ??
      (await database.get<OneWordStory>(
        "INSERT INTO one_word_stories (guild_id, created_at) VALUES (?, ?) RETURNING *;",
        guildId,
        new Date().toISOString(),
      ))
    );
  },

  addWordFor: async (
    guildId: string,
    word: string,
    user: string,
  ): Promise<OneWordStory> => {
    let old = await _actions.getCurrentFor(guildId);
    let completed = await database.get<OneWordStory>(
      "UPDATE one_word_stories SET sentence = ?, last_user = ? WHERE id = ? RETURNING *",
      old.sentence + " " + word,
      user,
      old.id,
    );

    if (word.endsWith(".")) {
      completed = await database.get<OneWordStory>(
        "UPDATE one_word_stories SET done = true WHERE id = ? RETURNING *",
        old.id,
      );
    }

    return completed;
  },
} as const;

export default _actions;
