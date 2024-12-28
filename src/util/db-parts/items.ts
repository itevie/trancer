import { database } from "../database";

const _actions = {
  // ----- Single -----
  get: async (id: number): Promise<Item | null> => {
    return await database.get<Item>("SELECT * FROM items WHERE id = ?;", id);
  },

  getId: async (name: string): Promise<number> => {
    return (
      await database.get<Item>("SELECT * FROM items WHERE name = ?;", name)
    ).id;
  },

  getAll: async (): Promise<Item[]> => {
    return await database.all<Item[]>("SELECT * FROM items;");
  },

  getByName: async (name: string): Promise<Item | null> => {
    return await database.get<Item>(
      "SELECT * FROM items WHERE name = ?;",
      name
    );
  },

  // ----- Multiple -----
  getByTag: async (tag: string): Promise<Item[]> => {
    return await database.all<Item[]>(
      "SELECT * FROM items WHERE tag = ?;",
      tag
    );
  },

  // ----- Modification -----

  // ----- Aquired -----
  aquired: {
    getAllFor: async (userId: string): Promise<AquiredItem[]> => {
      return await database.all<AquiredItem[]>(
        "SELECT * FROM aquired_items WHERE user_id = ? AND amount > 0;",
        userId
      );
    },

    getFor: async (userId: string, itemId: number): Promise<AquiredItem> => {
      return (
        (await database.get<AquiredItem>(
          "SELECT * FROM aquired_items WHERE user_id = ? AND item_id = ?;",
          userId,
          itemId
        )) ??
        (await database.get<AquiredItem>(
          "INSERT INTO aquired_items (user_id, item_id) VALUES (?, ?) RETURNING *;",
          userId,
          itemId
        ))
      );
    },

    get: async (itemId: number): Promise<AquiredItem[]> => {
      return await database.all<AquiredItem[]>(
        "SELECT * FROM aquired_items WHERE item_id = ? AND amount > 0;",
        itemId
      );
    },

    resolveFrom: async (
      aquired: AquiredItem[]
    ): Promise<(Item & AquiredItem)[]> => {
      const items: (Item & AquiredItem)[] = [];

      for await (const fakeItem of aquired) {
        const item = await _actions.get(fakeItem.item_id);
        items.push({
          ...item,
          ...fakeItem,
        });
      }

      return items;
    },

    // ----- Modification -----
    addFor: async (
      userId: string,
      itemId: number,
      amount: number = 1
    ): Promise<void> => {
      await _actions.aquired.getFor(userId, itemId);
      await database.run(
        "UPDATE aquired_items SET amount = amount + ? WHERE user_id = ? AND item_id = ?;",
        amount,
        userId,
        itemId
      );
    },

    removeFor: async (
      userId: string,
      itemId: number,
      amount: number = 1
    ): Promise<void> => {
      await _actions.aquired.getFor(userId, itemId);
      await database.run(
        "UPDATE aquired_items SET amount = amount - ? WHERE user_id = ? AND item_id = ?;",
        amount,
        userId,
        itemId
      );
    },

    removeManyFor: async (
      userId: string,
      items: { [key: number]: number }
    ): Promise<void> => {
      for await (const [id, amount] of Object.entries(items)) {
        await _actions.aquired.removeFor(userId, parseInt(id), amount);
      }
    },

    setLock: async (
      userId: string,
      itemId: number,
      lock: boolean
    ): Promise<void> => {
      await database.run(
        `UPDATE aquired_items SET protected = ? WHERE user_id = ? AND item_id = ?;`,
        lock,
        userId,
        itemId
      );
    },
  },
} as const;

export default _actions;
