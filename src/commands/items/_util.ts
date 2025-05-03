import { actions, database } from "../../util/database";
import {
  biasedRandomFromRange,
  englishifyList,
  randomMinMax,
  RandomMinMax,
  shuffle,
} from "../../util/other";
import { currency, itemText } from "../../util/language";
import { itemMap } from "../../util/db-parts/items";

interface RewardDetails {
  currency: number;
  items: { [key: number]: number };
}

export interface RandomRewardOptions {
  currency?: RandomMinMax;

  items?: {
    // Key: item ID, value: weight
    pool: "get-db" | { [key: number | string]: number };
    count: {
      min: number;
      max: number;
    };
  };
}

/**
 * Award random items to a user, and return the stringified result
 * @param userId The user
 * @param details The options
 * @returns The stringified result
 */
export async function awardRandomThings(
  userId: string,
  details: RandomRewardOptions,
): Promise<string> {
  let rewards = await generateRandomReward(details);
  await giveRewardDeteils(userId, rewards);
  const english = await englishifyRewardDetails(rewards);
  return english;
}

/**
 * Give a user rewards
 * @param userId The user
 * @param details The options
 */
export async function giveRewardDeteils(
  userId: string,
  details: RewardDetails,
): Promise<void> {
  if (details.currency) await actions.eco.addMoneyFor(userId, details.currency);
  for await (const [item, amount] of Object.entries(details.items)) {
    await actions.items.aquired.addFor(userId, parseInt(item), amount);
  }
}

/**
 * Turns random reward details into a english list
 * @param details The rewards given
 * @returns The Englishified list
 */
export async function englishifyRewardDetails(
  details: RewardDetails,
): Promise<string> {
  let winnings: string[] = [];
  if (details.currency !== 0) winnings.push(`${currency(details.currency)}`);

  for await (const [id, quantity] of Object.entries(details.items)) {
    const item = await actions.items.get(parseInt(id));
    winnings.push(`${itemText(item, quantity, true)}`);
  }

  return englishifyList(winnings);
}

/**
 * Generates a random amount of things based on the options
 * @param options What to award
 * @returns The string representation of what was awarded
 */
export async function generateRandomReward(
  options: RandomRewardOptions,
): Promise<RewardDetails> {
  let winnings: RewardDetails = {
    currency: 0,
    items: {},
  };

  if (options.currency) {
    winnings.currency = randomMinMax(options.currency);
  }

  if (options.items) {
    let { pool, count } = options.items;
    if (pool === "get-db") {
      pool = Object.fromEntries(
        (await database.all<Item[]>("SELECT * FROM items;")).map((x) => [
          x.id.toString(),
          x.weight,
        ]),
      );
    } else {
      for (const key of Object.keys(pool)) {
        if (!key.match(/[0-9]+/)) {
          let old = pool[key];
          pool[itemMap[key].id] = old;
          delete pool[key];
        }
      }
    }

    let poolEntries = Object.entries(pool);
    shuffle(poolEntries);
    const totalWeight = poolEntries.reduce((c, v) => c + v[1], 0);
    const amount = biasedRandomFromRange(count.min, count.max);
    const selectedItems: { [key: number]: number } = {};

    for (let i = 0; i < amount; i++) {
      const randomValue = Math.random() * totalWeight;
      let cumulativeWeight = 0;
      let itemSelected = false;

      for (const [itemId, weight] of poolEntries) {
        cumulativeWeight += weight;

        if (randomValue <= cumulativeWeight) {
          const id = parseInt(itemId);
          selectedItems[id] = (selectedItems[id] || 0) + 1;
          itemSelected = true;
          break;
        }
      }
    }

    winnings.items = selectedItems;
  }

  return winnings;
}

/**
 * Calculates the price of an item
 * @returns The price
 */
export function calculateItemPrice(item: Item): number {
  return Math.max(1, Math.round(Math.min(0.7, 1 - item.weight) * item.price));
}
