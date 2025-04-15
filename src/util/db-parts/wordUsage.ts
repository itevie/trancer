import { Message } from "discord.js";
import { analyticDatabase } from "../analytics";

let definedCache: Map<string, number> = new Map();
let definedCacheReversed: Map<number, string> = new Map();
let init: boolean = false;

export interface Word {
  id: number;
  word: string;
}

export interface UsedWord {
  word_id: number;
  author_id: string;
  server_id: string;
  channel_id: string;
  created_at: string;
  amount: number;
}

const _actions = {
  createWord: async (word: string): Promise<Word> => {
    let _word =
      (await analyticDatabase.get<Word>(
        "SELECT * FROM words WHERE word = ?",
        word,
      )) ??
      (await analyticDatabase.get<Word>(
        "INSERT INTO words (word) VALUES (?) RETURNING *",
        word,
      ));
    definedCache.set(word, _word.id);
    definedCacheReversed.set(_word.id, word);
    return _word;
  },

  getAllWords: async (): Promise<Word[]> => {
    return await analyticDatabase.all<Word[]>("SELECT * FROM words");
  },

  getFor: async (user: string, serverId: string): Promise<UsedWord[]> => {
    return await analyticDatabase.all<UsedWord[]>(
      "SELECT * FROM words_by WHERE author_id = ? AND server_id = ?",
      user,
      serverId,
    );
  },

  getForServer: async (serverId: string): Promise<UsedWord[]> => {
    return await analyticDatabase.all<UsedWord[]>(
      "SELECT * FROM words_by WHERE server_id = ?",
      serverId,
    );
  },

  toObject: async (words: UsedWord[]): Promise<{ [key: string]: number }> => {
    let result = words.reduce((p, c) => {
      let _word = definedCacheReversed.get(c.word_id);
      return { ...p, [_word]: (p[_word] ?? 0) + c.amount };
    }, {});

    return result;
  },

  initCache: async (): Promise<void> => {
    const words = await _actions.getAllWords();
    for (const word of words) {
      definedCache.set(word.word, word.id);
      definedCacheReversed.set(word.id, word.word);
    }
    init = true;
  },

  addMessage: async (
    message:
      | Message<true>
      | {
          content: string;
          author: { id: string };
          guild: { id: string };
          channel: { id: string };
        },
    date?: Date,
  ): Promise<void> => {
    if (!init) {
      _actions.initCache();
    }

    let words = message.content
      .toLowerCase()
      .split(" ")
      // Remove empties, and only keep words that have at least one character
      .filter((x) => x.length > 0 && x.match(/[a-z]/))
      .filter((word) => !word.startsWith("http"));

    let _time = date ? date : new Date();
    _time.setMinutes(0, 0, 0);
    let time = _time.toISOString();

    for await (const word of words) {
      if (!definedCache.has(word)) {
        const _word = await _actions.createWord(word);
        definedCache.set(word, _word.id);
        definedCacheReversed.set(_word.id, word);
      }

      let wordId = definedCache.get(word);
      await analyticDatabase.run(
        `INSERT INTO words_by (author_id, word_id, channel_id, created_at, server_id, amount)
          VALUES (?, ?, ?, ?, ?, 1)
        ON CONFLICT(author_id, word_id, channel_id, created_at)
        DO UPDATE SET amount = amount + 1`,
        message.author.id,
        wordId,
        message.channel.id,
        time,
        message.guild.id,
      );
      console.log(`Added ${word} for ${time}`);
    }
  },
} as const;

export default _actions;
