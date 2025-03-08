import { AquiredBadge } from "../../types/aquiredBadge";
import { database } from "../database";

const _actions = {
  addFor: async (userId: string, badgeName: string): Promise<boolean> => {
    if (
      !(await database.get(
        "SELECT 1 FROM aquired_badges WHERE user = ? AND badge_name = ?",
        userId,
        badgeName
      ))
    ) {
      await database.run(
        `INSERT INTO aquired_badges (user, badge_name) VALUES (?, ?)`,
        userId,
        badgeName
      );
      return true;
    }

    return false;
  },

  removeFor: async (userId: string, badgeName: string): Promise<void> => {
    await database.run(
      `DELETE FROM aquired_badges WHERE user = ? AND badge_name = ?;`,
      userId,
      badgeName
    );
  },

  aquired: {
    getAll: async (): Promise<AquiredBadge[]> => {
      return await database.all<AquiredBadge[]>(
        `SELECT * FROM aquired_badges;`
      );
    },

    getAllFor: async (userId: string): Promise<AquiredBadge[]> => {
      return await database.all<AquiredBadge[]>(
        `SELECT * FROM aquired_badges WHERE user = ?;`,
        userId
      );
    },
  },
} as const;

export default _actions;
