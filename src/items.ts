import config from "./config";
import ecoConfig from "./ecoConfig";
import { database, databaseLogger } from "./util/database";

/**
 * {[key: string]: [price, weight]}
 */
const fr = {
  veryCommon: [5, 0.9],
  common: [10, 0.8],
  uncommonish: [15, 0.75],
  uncommon: [15, 0.6],
  rarish: [25, 0.5],
  rare: [40, 0.2],
  veryRare: [55, 0.1],
  epic: [80, 0.05],
  legendary: [125, 0.04],
  mythic: [300, 0.01],
  divine: [1250, 0.005],
} as const;

/**
 * [name, [price, weight], emoji][]
 */
const fish: [string, readonly [number, number], string | null][] = [
  // ----- Standard -----
  ["cod", fr.veryCommon, "<:cod:1322128982027534367>"],
  ["common-fish", fr.common, "<:common_fish:1321758129872048189>"],
  ["salmon", fr.uncommonish, "<:salmon:1322129073811623991>"],
  ["uncommon-fish", fr.uncommon, "<:uncommon_fish:1321758154715041873>"],
  ["wide-salmon", fr.uncommon, "<:wide_salmon:1322129134423379991>"],
  ["pufferfish", fr.rarish, "<:pufferfish:1322129056086491136>"],
  ["rare-fish", fr.rare, "<:rare_fish:1321758169004773419>"],
  ["spiral-fish", fr.rare, "<:spiral_fish:1322129093684101193>"],
  ["scottish-fish", fr.rare, "<:scotish_fish:1321843773415886899>"],
  ["cute-fishy", fr.veryRare, "<:cute_fish:1321857857636798566>"],
  ["cookie-fish", fr.veryRare, "<:cookie_fish:1321843822115684483>"],
  ["transparent-fish", fr.veryRare, "<:transparent_fish:1321843791241678869>"],
  ["epic-fish", fr.epic, "<:epic_fish:1321758183882227755>"],
  ["basking-shark", fr.epic, null],
  ["angle-fish", fr.legendary, "<:angel_fish:1325262607812395079>"],
  ["devil-fish", fr.legendary, "<:devil_fish:1325262632776892487>"],
  ["mythic-fish", fr.mythic, "<:mythic_fish:1321758197178175588>"],
  ["dawn-fish", fr.mythic, null],
  ["weed-fish", fr.mythic, "<:weed_fish:1322130669479923762>"],
  ["fish", fr.mythic, "<:fish:1322130721548009512>"],
  ["gay-fish", fr.mythic, "<:gay_fish:1321843756592271441>"],
  ["trans-fish", fr.divine, "<:trans_fish:1321845160492925029>"],
  ["british-fish", fr.divine, "<:british_fish:1321758209983381534>"],

  // ----- Special -----
  ["catfish", [2, 0.3], "<:cat_fish:1322128963837104158>"],
  [
    "you-are-never-getting-this-fish",
    [5000, 0.0005],
    "<:you_are_never_getting_this_fish:1321758224222912604>",
  ],
  [
    "we-are-number-one-fish",
    [20_000, 0.00001],
    "<:we_are_number_one_fish:1322129116006449234>",
  ],
];

console.log(
  fish
    .filter((x) => !!x[2])
    .map((x) => x[2].match(x[2]))
    .join("")
);

const fishDescriptions: { [key: string]: string } = {
  "cute-fishy": "Aw... such a cutie patootie fishie",
  "dawn-fish":
    "According to all known laws of hypnosis, Dawn is a fish... allegedly.",
  catfish: "Such rare... very nothing... much scam...",
  "transparent-fish": "Woah.",
  "trans-fish": "Your average trans fish.",
  "gay-fish": "Gay!!!!",
  "scottish-fish": "SCOTLAND FOREVER!",
  "british-fish": "Pip pip cheerio!",
  "we-are-number-one-fish":
    "If you wanna be a villain number one, you have to catch a fishie on the run.",
} as const;

const items: Record<string, Partial<Item>> = {
  "card-pull": {
    price: 100,
    description: "Buy this, and pull a card using the `pull` command!",
    weight: 0.3,
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
    emoji: "<:juicebox:1322129011899502602>",
  },
  pendulum: {
    price: 50,
    description:
      "A pendulum! It goes this way and that. (good for playing with Dawn!)",
    weight: 0.2,
  },
  "fishing-rod": {
    price: 250,
    weight: 0.1,
    description:
      "You can fish more frequently. This has a 10% chance of breaking.",
    emoji: "<:fishing_rod:1321761522699210802>",
  },

  // ----- Resoureces -----
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

  // ----- Minerals -----
  coal: {
    price: 10,
    weight: 0.35,
    emoji: "<:coal:1325546270500196443>",
    tag: "mineral",
  },
  iron: {
    price: 30,
    weight: 0.2,
    emoji: "<:iron:1325546289261318294>",
    tag: "mineral",
  },
  gold: {
    price: 100,
    weight: 0.05,
    emoji: "<:gold:1325546308689199155>",
    tag: "mineral",
  },

  // ---- Craftables -----
  "stone-pickaxe": {
    price: 40,
    weight: 0.4,
    tag: "pickaxe",
    emoji: "<:stone_pickaxe:1325548046188286053> ",
  },

  // ----- Collectables -----
  "christmas-cookie": {
    price: 1000,
    weight: 0,
    description: "A tasty cookie given on 25/12/2024!",
    tag: "collectable",
    buyable: false,
    emoji: "<:chirtmas_cookie:1321761548372279337>",
  },

  // ----- Misc -----
  "lottery-ticket": {
    price: ecoConfig.lottery.entryPrice,
    weight: 0,
    droppable: false,
    buyable: ecoConfig.lottery.enabled,
    max: 5,
    emoji: "<:lottery_ticket:1322129029368909917>",
  },

  // ----- Load Fish -----
  ...Object.fromEntries(
    fish.map((x) => [
      x[0],
      {
        price: x[1][0],
        weight: x[1][1],
        description: fishDescriptions[x[0]] || null,
        emoji: x[2],
        tag: "fish",
      },
    ])
  ),
} as const;

const defaults: Omit<Item, "id" | "name"> = {
  price: 10,
  description: null,
  weight: 0.5,
  droppable: true,
  tag: null,
  buyable: true,
  emoji: null,
  max: null,
};

export async function setupItems(): Promise<void> {
  const dbItems = await database.all<Item[]>("SELECT * FROM items;");

  for (const [name, item] of Object.entries(items)) {
    const databaseItem = dbItems.find((i) => i.name === name);
    if (!databaseItem) {
      await database.run(
        `
        INSERT INTO items (name, price, description, weight, droppable, tag, buyable, emoji, max)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
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
