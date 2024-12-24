import { database, databaseLogger } from "./util/database";

const items: Record<string, Partial<Item>> = {
  "card-pull": {
    price: 100,
    description: "Buy this, and pull a card using the `pull` command!",
    weight: 0.2,
  },
  "hair-dye": {
    price: 150,
    description:
      "Dye the hair of your Dawn! Use the `dyehair` command to do so!",
    weight: 0.05,
  },
  hair: {
    price: 30,
    description: "Feed your Dawn some hair and it'll be a lot less hungry!",
    weight: 0.5,
  },
  pendulum: {
    price: 50,
    description: "A pendulum! It goes this way and that.",
    weight: 0.2,
  },
  stick: {
    price: 20,
    description: "A stick.",
    weight: 0.7,
  },
  // ----- Fish -----
  "common-fish": {
    price: 10,
    weight: 0.8,
    tag: "fish",
  },
} as const;

const defaults: Omit<Item, "id" | "name"> = {
  price: 10,
  description: null,
  weight: 0.5,
  droppable: true,
  tag: null,
};

export async function setupItems(): Promise<void> {
  const dbItems = await database.all<Item[]>("SELECT * FROM items;");

  for (const [name, item] of Object.entries(items)) {
    const databaseItem = dbItems.find((i) => i.name === name);
    if (!databaseItem) {
      await database.run(
        `
        INSERT INTO items (name, price, description, weight, droppable, tag)
        VALUES (?, ?, ?, ?, ?, ?);
      `,
        name,
        ...Object.entries(defaults).map(([k, v]) => (k in item ? item[k] : v))
      );
      databaseLogger.log(`Insert item: ${name}`);
      continue;
    }

    // Now check keys
    for (const [k, v] of Object.entries(item)) {
      if (item[k] !== databaseItem[k]) {
        await database.run(
          `UPDATE items SET ${k} = ? WHERE name = ?;`,
          v,
          name
        );
        databaseLogger.log(`Update item ${name}, ${k} = ${v}`);
      }
    }
  }

  databaseLogger.log("Updated items");
}
