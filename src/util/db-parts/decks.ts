import { database } from "../database";

const _actions = {
  getAll: async (): Promise<Deck[]> => {
    return await database.all<Deck[]>("SELECT * FROM decks;");
  },
} as const;

export default _actions;
