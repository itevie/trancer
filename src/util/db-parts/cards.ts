import { database } from "../database";

const _actions = {
  getAll: async (): Promise<Card[]> => {
    return await database.all<Card[]>("SELECT * FROM cards;");
  },
} as const;

export default _actions;
