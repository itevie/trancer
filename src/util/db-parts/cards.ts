import { database } from "../database";

const _actions = {
  add: async (
    name: string,
    deckID: number,
    rarity: string,
    fileName: string,
    link: string
  ): Promise<Card> => {
    return await database.get(
      `INSERT INTO cards (name, deck, rarity, file_name, link) VALUES (?, ?, ?, ?, ?) RETURNING *`,
      name,
      deckID,
      rarity,
      fileName,
      link
    );
  },

  getById: async (id: number): Promise<Card | undefined> => {
    return await database.get(`SELECT * FROM cards WHERE id = ?`, id);
  },

  getByName: async (name: string): Promise<Card | undefined> => {
    return await database.get(
      `SELECT * FROM cards WHERE name = ? LIMIT 1;`,
      name
    );
  },

  getAll: async (): Promise<Card[]> => {
    return await database.all<Card[]>("SELECT * FROM cards");
  },

  addFor: async (
    userId: string,
    cardId: number,
    amount: number = 1
  ): Promise<void> => {
    await _actions.aquired.getFor(userId, cardId);
    await database.run(
      `UPDATE aquired_cards SET amount = amount + ? WHERE user_id = ? AND card_id = ?;`,
      amount,
      userId,
      cardId
    );
  },

  removeFor: async (
    userId: string,
    cardId: number,
    amount: number = 1
  ): Promise<void> => {
    await _actions.aquired.getFor(userId, cardId);
    await database.run(
      `UPDATE aquired_cards SET amount = amount - ? WHERE user_id = ? AND card_id = ?;`,
      amount,
      userId,
      cardId
    );
  },

  decks: {
    getByName: async (name: string): Promise<Deck> => {
      return (await database.get(
        `SELECT * FROM decks WHERE LOWER(name) = LOWER(?)`,
        name
      )) as Deck;
    },

    getById: async (id: number): Promise<Deck> => {
      return (await database.get(
        `SELECT * FROM decks WHERE id = ?`,
        id
      )) as Deck;
    },
  },

  aquired: {
    getAllFor: async (userId: string): Promise<AquiredCard[]> => {
      return await database.all(
        `SELECT * FROM aquired_cards WHERE user_id = ?`,
        userId
      );
    },

    getAll: async (): Promise<AquiredCard[]> => {
      return await database.all(`SELECT * FROM aquired_cards`);
    },

    getFor: async (userId: string, cardId: number): Promise<AquiredCard> => {
      let result = await database.get(
        `SELECT * FROM aquired_cards WHERE user_id = ? AND card_id = ?;`,
        userId,
        cardId
      );
      if (!result)
        result = await database.get(
          `INSERT INTO aquired_cards (card_id, user_id) VALUES (?, ?) RETURNING *`,
          cardId,
          userId
        );
      return result;
    },
  },
} as const;

export default _actions;
