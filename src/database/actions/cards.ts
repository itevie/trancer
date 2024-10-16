import type { TrancerDatabase } from "../database.ts";

interface CreateCardOptions {
  name: string;
  deckId: number;
  rarity: string;
  fileName: string;
  link: string;
}

export default class TrancerDatabaseCards {
  private database: TrancerDatabase;

  constructor(database: TrancerDatabase) {
    this.database = database;
  }

  public async add(options: CreateCardOptions): Promise<Card> {
    return await this.database.connection.get<Card>(
      `INSERT INTO cards (name, deck, rarity, file_name, link) VALUES (?, ?, ?, ?, ?) RETURNING *`,
      options.name,
      options.deckId,
      options.rarity,
      options.fileName,
      options.link,
    ) as Card;
  }

  public async getById(id: number): Promise<Card | undefined> {
    return await this.database.connection.get<Card>(
      `SELECT * FROM cards WHERE id = ?;`,
      id,
    );
  }

  public async getByName(name: string): Promise<Card | undefined> {
    return await this.database.connection.get<Card>(
      `SELECT * FROM cards WHERE name = ?;`,
      name,
    );
  }

  aquired = {
    getAllFor: async (userId: string): Promise<AquiredCard[]> => {
      return await this.database.connection.all<AquiredCard[]>(
        `SELECT * FROM aquired_cards WHERE user_id = ?`,
        userId,
      );
    },

    getFor: async (userId: string, cardId: number): Promise<AquiredCard> => {
      let result = await this.database.connection.get<AquiredCard>(
        `SELECT * FROM aquired_cards WHERE user_id = ? AND card_id = ?`,
        userId,
        cardId,
      );
      if (!result) {
        result = await this.database.connection.get<AquiredCard>(
          `INSERT INTO aquired_cards (user_id, card_id) VALUES (?, ?) RETURNING *;`,
          userId,
          cardId,
        ) as AquiredCard;
      }
      return result;
    },

    getAll: async (): Promise<AquiredCard[]> => {
      return await this.database.connection.all<AquiredCard[]>(
        "SELECT * FROM aquired_cards;",
      );
    },

    addFor: async (
      userId: string,
      cardId: number,
      amount: number = 1,
    ): Promise<void> => {
      await this.aquired.getFor(userId, cardId);
      await this.database.connection.run(
        `UPDATE aquired_cards SET amount = amount + ? WHERE user_id = ? AND card_id = ?;`,
        amount,
        userId,
        cardId,
      );
    },

    removeFor: async (
      userId: string,
      cardId: number,
      amount: number = 1,
    ): Promise<void> => {
      await this.aquired.getFor(userId, cardId);
      await this.database.connection.run(
        `UPDATE aquired_cards SET amount = amount - ? WHERE user_id = ? AND card_id = ?;`,
        amount,
        userId,
        cardId,
      );
    },
  };
}
