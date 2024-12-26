import { database, databaseLogger } from "./util/database";

const items: Record<string, Partial<Item>> = {
  "card-pull": {
    price: 100,
    description: "Buy this, and pull a card using the `pull` command!",
    weight: 0.2,
    emoji: "<:card_pull:1321761564314964010> ",
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
    emoji: "<:stick:1321761484174524498>",
  },
  rock: {
    price: 10,
    description: "A rock.",
    weight: 0.5,
    emoji: "<:rock:1321761504386744391>",
  },
  "fishing-rod": {
    price: 250,
    weight: 0.1,
    description:
      "You can fish more frequently. This has a 10% chance of breaking.",
    emoji: "<:fishing_rod:1321761522699210802>",
  },
  // ----- Fish -----
  "common-fish": {
    price: 10,
    weight: 0.8,
    tag: "fish",
    emoji: "<:common_fish:1321758129872048189>",
  },
  "uncommon-fish": {
    price: 20,
    weight: 0.6,
    tag: "fish",
    emoji: "<:uncommon_fish:1321758154715041873>",
  },
  "rare-fish": {
    price: 50,
    weight: 0.2,
    tag: "fish",
    emoji: "<:rare_fish:1321758169004773419>",
  },
  "epic-fish": {
    price: 100,
    weight: 0.05,
    tag: "fish",
    emoji: "<:epic_fish:1321758183882227755>",
  },
  "mythic-fish": {
    price: 450,
    weight: 0.01,
    tag: "fish",
    emoji: "<:mythic_fish:1321758197178175588>",
  },
  "you-are-never-getting-this-fish": {
    price: 5000,
    weight: 0.001,
    tag: "fish",
    emoji: "<:you_are_never_getting_this_fish:1321758224222912604>",
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
    weight: 0.0069,
    description: "Pip pip cheerio!",
    tag: "fish",
    emoji: "<:british_fish:1321758209983381534>",
  },
  "basking-shark": {
    price: 5000,
    weight: 0.001,
    tag: "fish",
  },
  "cookie-fish": {
    price: 50,
    weight: 0.05,
    tag: "fish",
    emoji: "<:cookie_fish:1321843822115684483>",
  },
  "transparent-fish": {
    price: 100,
    weight: 0.1,
    tag: "fish",
    emoji: "<:transparent_fish:1321843791241678869>",
  },
  "gay-fish": {
    price: 300,
    weight: 0.009,
    tag: "fish",
    emoji: "<:gay_fish:1321843756592271441>",
  },
  "scottish-fish": {
    price: 100,
    weight: 0.2,
    tag: "fish",
    emoji: "<:scotish_fish:1321843773415886899>",
  },
  "trans-fish": {
    price: 5000,
    weight: 0.005,
    tag: "fish",
    emoji: "<:trans_fish:1321845160492925029>",
  },
  "christmas-cookie": {
    price: 1000,
    weight: 0,
    description: "A tasty cookie given on 25/12/2024!",
    tag: "collectable",
    buyable: false,
    emoji: "<:chirtmas_cookie:1321761548372279337>",
  },
} as const;

const defaults: Omit<Item, "id" | "name"> = {
  price: 10,
  description: null,
  weight: 0.5,
  droppable: true,
  tag: null,
  buyable: true,
  emoji: null,
};

export async function setupItems(): Promise<void> {
  const dbItems = await database.all<Item[]>("SELECT * FROM items;");

  for (const [name, item] of Object.entries(items)) {
    const databaseItem = dbItems.find((i) => i.name === name);
    if (!databaseItem) {
      await database.run(
        `
        INSERT INTO items (name, price, description, weight, droppable, tag, buyable, emoji)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
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
