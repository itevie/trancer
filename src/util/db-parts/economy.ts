import { addMoneyTransaction } from "../analytics";
import { database } from "../database";

export type moneyAddReasons =
  | "gambling"
  | "commands"
  | "messaging"
  | "vc"
  | "helping";

const _actions = {
  existsFor: async (userId: string): Promise<boolean> => {
    return (
      (await database.all(`SELECT * FROM economy WHERE user_id = (?)`, userId))
        .length !== 0
    );
  },

  createFor: async (userId: string): Promise<Economy> => {
    return await database.get(
      `INSERT INTO economy (user_id) VALUES ((?)) RETURNING *`,
      userId
    );
  },

  getFor: async (userId: string): Promise<Economy> => {
    return (
      (await database.get<Economy | undefined>(
        `SELECT * FROM economy WHERE user_id = (?);`,
        userId
      )) || (await _actions.createFor(userId))
    );
  },

  getAll: async (): Promise<Economy[]> => {
    return (await database.all(`SELECT * FROM economy`)) as Economy[];
  },

  addMoneyFor: async (
    userId: string,
    amount: number,
    reason?: moneyAddReasons
  ): Promise<void> => {
    let eco = (await database.get(
      `UPDATE economy SET balance = balance + ? WHERE user_id = ? RETURNING *`,
      amount,
      userId
    )) as Economy;
    if (reason) {
      await database.run(
        `UPDATE economy SET from_${reason} = from_${reason} + ? WHERE user_id = ?`,
        amount,
        userId
      );
    }

    await addMoneyTransaction(userId, eco.balance);
  },

  removeMoneyFor: async (
    userId: string,
    amount: number,
    gamblingRelated?: boolean
  ): Promise<void> => {
    let eco = (await database.get(
      `UPDATE economy SET balance = balance - (?) WHERE user_id = (?) RETURNING *`,
      amount,
      userId
    )) as Economy;
    if (gamblingRelated) {
      await database.run(
        `UPDATE economy SET from_gambling_lost = from_gambling_lost + ? WHERE user_id = ?`,
        amount,
        userId
      );
    }

    await addMoneyTransaction(userId, eco.balance);
  },

  setMoneyFor: async (userId: string, amount: number): Promise<void> => {
    let eco = (await database.get(
      `UPDATE economy SET balance = (?) WHERE user_id = (?) RETURNING *`,
      amount,
      userId
    )) as Economy;
    await addMoneyTransaction(userId, eco.balance);
  },

  setLastFish: async (userId: string): Promise<void> => {
    await database.run(
      `UPDATE economy SET last_fish = (?) WHERE user_id = (?)`,
      Date.now(),
      userId
    );
  },

  setLastDaily: async (userId: string): Promise<void> => {
    await database.run(
      `UPDATE economy SET last_daily = (?) WHERE user_id = (?)`,
      Date.now(),
      userId
    );
  },
} as const;

export default _actions;
