import { database } from "../database";

const _actions = {
  exists: async (name: string): Promise<boolean> => {
    return (
      (await database.all(`SELECT * FROM ranks WHERE rank_name = (?)`, name))
        .length !== 0
    );
  },
} as const;

export default _actions;
