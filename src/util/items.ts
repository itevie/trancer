import config from "../config";
import { addMoneyFor } from "./actions/economy";
import { actions, database } from "./database";
import {
  biasedRandomFromRange,
  englishifyList,
  randomFromRange,
  shuffle,
} from "./other";
import { currency, itemText } from "./textProducer";

interface RewardDetails {
  currency: number;
  items: { [key: number]: number };
}

interface RandomRewardOptions {
  currency?: {
    min: number;
    max: number;
  };

  items?: {
    // Key: item ID, value: weight
    pool: "get-db" | { [key: number]: number };
    count: {
      min: number;
      max: number;
    };
  };
}

export async function awardRandomThings(
  userId: string,
  details: RandomRewardOptions
): Promise<string> {
  let rewards = await generateRandomReward(details);
  await giveRewardDeteils(userId, rewards);
  const english = await englishifyRewardDetails(rewards);
  return english;
}

export async function giveRewardDeteils(
  userId: string,
  details: RewardDetails
): Promise<void> {
  if (details.currency) await addMoneyFor(userId, details.currency);
  for await (const [item, amount] of Object.entries(details.items)) {
    await actions.items.aquired.addFor(userId, parseInt(item), amount);
  }
}

export async function englishifyRewardDetails(
  details: RewardDetails
): Promise<string> {
  let winnings: string[] = [];
  if (details.currency !== 0) winnings.push(`${currency(details.currency)}`);

  for await (const [id, quantity] of Object.entries(details.items)) {
    const item = await actions.items.get(parseInt(id));
    winnings.push(
      `**${quantity} ${itemText(item)}${quantity !== 1 ? "s" : ""}**`
    );
  }

  return englishifyList(winnings);
}

/**
 * Awards a random amount of things based on the options
 * @param options What to award
 * @returns The string representation of what was awarded
 */
export async function generateRandomReward(
  options: RandomRewardOptions
): Promise<RewardDetails> {
  let winnings: RewardDetails = {
    currency: 0,
    items: {},
  };

  if (options.currency) {
    winnings.currency = randomFromRange(
      options.currency.min,
      options.currency.max
    );
  }

  if (options.items) {
    let { pool, count } = options.items;
    if (pool === "get-db") {
      pool = Object.fromEntries(
        (await database.all<Item[]>("SELECT * FROM items;")).map((x) => [
          x.id.toString(),
          x.weight,
        ])
      );
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

export function calculateItemPrice(item: Item): number {
  return Math.round(Math.min(0.7, 1 - item.weight) * item.price);
}
