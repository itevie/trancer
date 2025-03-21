import { database } from "../database";

const _actions = {
  get: async (name: string): Promise<Rank | undefined> => {
    return await database.get("SELECT * FROM ranks WHERE rank_name = ?", name);
  },

  getAll: async (): Promise<Rank[]> => {
    return await database.all<Rank[]>("SELECT * FROM ranks");
  },

  exists: async (name: string): Promise<boolean> => {
    return (
      (await database.all(`SELECT * FROM ranks WHERE rank_name = (?)`, name))
        .length !== 0
    );
  },

  create: async (name: string, createdBy: string): Promise<Rank> => {
    return await database.get<Rank>(
      "INSERT INTO ranks (rank_name, created_by) VALUES (?, ?) RETURNING *",
      name,
      createdBy
    );
  },

  delete: async (name: string): Promise<void> => {
    await database.run("DELETE FROM votes WHERE rank_name = ?", name);
    await database.run("DELETE FROM ranks WHERE rank_name = ?", name);
  },

  votes: {
    getForRank: async (name: string): Promise<Vote[]> => {
      return await database.all<Vote[]>(
        "SELECT * FROM votes WHERE rank_name = ?",
        name
      );
    },

    getVoterFor: async (
      name: string,
      voter: string
    ): Promise<Vote | undefined> => {
      return await database.get<Vote>(
        "SELECT * FROM votes WHERE rank_name = ? AND voter = ?",
        name,
        voter
      );
    },

    aggregate: (
      votes: Vote[]
    ): { [key: string]: Rank & { amount: number } } => {
      return votes.reduce((p, c) => {
        return {
          ...p,
          [c.rank_name]: {
            amount: (p[c.rank_name]?.amount ?? 0) + 1,
            rank_name: c.rank_name,
          },
        };
      }, {});
    },

    getAllForUser: async (
      user: string
    ): Promise<(Rank & { amount: number })[]> => {
      return Object.entries(
        _actions.votes.aggregate(
          await database.all<Vote[]>(
            "SELECT * FROM votes WHERE votee = ?",
            user
          )
        )
      ).map((x) => x[1]);
    },

    getAllBy: async (user: string): Promise<Vote[]> => {
      return await database.all<Vote[]>(
        "SELECT * FROM votes WHERE voter = ?",
        user
      );
    },

    getAllForOn: async (name: string, user: string): Promise<string[]> => {
      return (
        await database.all<{ voter: string }[]>(
          "SELECT voter FROM votes WHERE votee = ? AND rank_name = ?",
          user,
          name
        )
      ).map((x) => x.voter);
    },

    add: async (
      name: string,
      votee: string,
      voter: string
    ): Promise<string | null> => {
      let prev = await _actions.votes.getVoterFor(name, voter);
      if (prev) {
        await _actions.votes.remove(name, voter);
      }

      await database.run(
        "INSERT INTO votes (rank_name, votee, voter) VALUES (?, ?, ?)",
        name,
        votee,
        voter
      );

      return prev ? prev.votee : null;
    },

    remove: async (name: string, user: string): Promise<void> => {
      await database.run(
        "DELETE FROM votes WHERE rank_name = ? AND voter = ?",
        name,
        user
      );
    },
  },
} as const;

export default _actions;
