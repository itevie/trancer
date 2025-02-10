import { database } from "../database";

const _actions = {
  getAll: async (): Promise<Spiral[]> => {
    return await database.all<Spiral[]>("SELECT * FROM spirals;");
  },

  getById: async (id: number): Promise<Spiral | null> => {
    return await database.get<Spiral>(
      "SELECT * FROM spirals WHERE id = ?;",
      id
    );
  },

  has: async (link: string): Promise<boolean> => {
    return !(await database.get("SELECT 1 FROM spirals WHERE link = ?;", link));
  },

  add: async (
    link: string,
    author: string,
    fileName: string
  ): Promise<Spiral> => {
    return await database.get<Spiral>(
      "INSERT INTO spirals (link, sent_by, file_name) VALUES (?, ?, ?) RETURNING *;",
      link,
      author,
      fileName
    );
  },

  delete: async (id: number): Promise<void> => {
    await database.run("DELETE FROM spirals WHERE id = ?;", id);
  },

  favourites: {
    getFor: async (userId: string): Promise<Spiral[]> => {
      return await database.all<Spiral[]>(
        `SELECT s.*
        FROM spirals s
        INNER JOIN user_favourite_spirals f
        ON s.id = f.id
        WHERE f.user_id = ?`,
        userId
      );
    },

    addFor: async (userId: string, spiral: number): Promise<void> => {
      await database.run(
        "INSERT INTO user_favourite_spirals (id, user_id) VALUES (?, ?);",
        spiral,
        userId
      );
    },

    removeFor: async (userId: string, spiral: number): Promise<void> => {
      await database.run(
        "DELETE FROM user_favourite_spirals WHERE user_id = ? AND id = ?;",
        userId,
        spiral
      );
    },
  },
} as const;

export default _actions;
