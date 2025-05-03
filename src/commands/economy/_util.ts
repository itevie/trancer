import { User } from "discord.js";
import { actions } from "../../util/database";
import ecoConfig from "../../ecoConfig";

/**
 * Calculate the ratelimit for fishing
 * @param user The user to check
 */
export async function calculateFishingRatelimit(user: User): Promise<number> {
  let item = await actions.items.aquired.getFor(
    user.id,
    await actions.items.getId(ecoConfig.items.fishingRod),
  );

  return item && item.amount > 0
    ? ecoConfig.payouts.fish.limit / 2
    : ecoConfig.payouts.fish.limit;
}

/**
 * Get's the user's best pickaxe (by price)
 */
export async function getUsersBestPickaxe(
  user: User,
): Promise<(Item & AquiredItem) | null> {
  const pickaxe = (
    await actions.items.aquired.resolveFrom(
      await actions.items.aquired.getAllFor(user.id),
    )
  )
    .filter((item) => item.tag === "pickaxe")
    .sort((a, b) => b.price - a.price)[0];
  return pickaxe;
}
