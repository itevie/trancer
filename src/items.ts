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
  juicebox: {
    price: 15,
    description: "Give your Dawn some juice and it'll be a lot less thirsty!",
    weight: 0.55,
  },
  pendulum: {
    price: 50,
    description:
      "A pendulum! It goes this way and that. (good for playing with Dawn!)",
    weight: 0.2,
  },
  stick: {
    price: 5,
    description: "A stick.",
    weight: 0.9,
  },
  // ----- Fish -----
  "common-fish": {
    price: 10,
    weight: 0.8,
    tag: "fish",
  },
  "uncommon-fish": {
    price: 40,
    weight: 0.6,
    tag: "fish",
  },
  "rare-fish": {
    price: 100,
    weight: 0.2,
    tag: "fish",
  },
  "epic-fish": {
    price: 200,
    weight: 0.05,
    tag: "fish",
  },
  "mythic-fish": {
    price: 500,
    weight: 0.01,
    tag: "fish",
  },
  "you-are-never-getting-this-fish": {
    price: 5000,
    weight: 0.001,
    tag: "fish",
  },
  "dawn-fish": {
    price: 2500,
    weight: 0.01,
    tag: "fish",
  },
  "cute-fishy": {
    price: 150,
    weight: 0.1,
    description: "Aw... such a cutie patootie fishie",
    tag: "fish",
  },
  "british-fish": {
    price: 300,
    weight: 0.069,
    description: "Pip pip cheerio!",
    tag: "fish",
  },
  "basking-shark": {
    price: 5000,
    weight: 0.001,
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
