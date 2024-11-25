import { AquiredBadge } from "../types/aquiredBadge";
import {
  addBadgeFor,
  getAllAquiredBadges,
  removeBadgeFor,
} from "./actions/badges";
import { getAllEconomy } from "./actions/economy";
import { database } from "./database";
import config from "../config";
import { calculateLevel } from "../messageHandlers/xp";

export interface Badge {
  name: string;
  description: string;
  emoji: string;
  scan: () => any;
}

async function handleEcoPositionalBadges() {
  let economy = (await getAllEconomy()).sort((a, b) => b.balance - a.balance);
  let badges = await getAllAquiredBadges();

  // Get current ones
  let first = economy[0].user_id;
  let second = economy[1].user_id;
  let third = economy[2].user_id;

  // Get database ones
  let dbFirst = badges.find((x) => x.badge_name === "eco#1")?.user || "-1";
  let dbSecond = badges.find((x) => x.badge_name === "eco#2")?.user || "-1";
  let dbThird = badges.find((x) => x.badge_name === "eco#3")?.user || "-1";

  // Check if they are same
  if (first !== dbFirst) {
    await removeBadgeFor(dbFirst, "eco#1");
    await addBadgeFor(first, "eco#1");
  }

  if (second !== dbSecond) {
    await removeBadgeFor(dbSecond, "eco#2");
    await addBadgeFor(second, "eco#2");
  }

  if (third !== dbThird) {
    await removeBadgeFor(dbThird, "eco#3");
    await addBadgeFor(third, "eco#3");
  }
}

const badges: { [key: string]: Badge } = {
  yapper: {
    name: "Yapper",
    description: "Sent 1000 messages",
    emoji: ":speaking_head:",
    scan: async () => {
      const users = (await database.all(
        `SELECT * FROM user_data;`
      )) as UserData[];
      const aquired = await getAllAquiredBadges();

      for (const user of users) {
        if (
          user.messages_sent > 1000 &&
          !aquired.find(
            (x) => x.user === user.user_id && x.badge_name === "yapper"
          )
        )
          await addBadgeFor(user.user_id, "yapper");
      }
    },
  },
  level15: {
    name: "Level 15",
    description: "Get to level 15",
    emoji: ":chart_with_upwards_trend:",
    scan: async () => {
      const aquired = await getAllAquiredBadges();
      const users = (await database.all(
        "SELECT * FROM user_data;"
      )) as UserData[];
      for (const user of users) {
        if (
          calculateLevel(user.xp || 0) >= 15 &&
          !aquired.find(
            (x) => x.user === user.user_id && x.badge_name === "level15"
          )
        )
          await addBadgeFor(user.user_id, "level15");
      }
    },
  },
  botfuckerupper: {
    name: "Bot Fucker Upper",
    description: "Broke the bot (like found a glitch)",
    emoji: ":sob:",
    scan: async () => {
      /*const users = await getAllEconomy();
            const aquired = await getAllAquiredBadges();

            for (const user of users)
                if (user.balance < 0 || user.balance % 1 !== 0)
                    if (!aquired.find(x => x.user === user.user_id && x.badge_name === "botfuckerupper"))
                        await addBadgeFor(user.user_id, "botfuckerupper")*/
    },
  },
  "500vcminutes": {
    name: "500 VC Minutes",
    description: "Been in a VC for 500 minutes (about 8 hours)",
    emoji: ":telephone_receiver:",
    scan: async () => {
      const users = (await database.all(
        `SELECT * FROM user_data;`
      )) as UserData[];
      const aquired = await getAllAquiredBadges();

      for (const user of users) {
        if (
          user.vc_time > 500 &&
          !aquired.find(
            (x) => x.user === user.user_id && x.badge_name === "500vcminutes"
          )
        )
          await addBadgeFor(user.user_id, "500vcminutes");
      }
    },
  },
  "5kmoney": {
    name: "Money Maker",
    description: `Reached 5000${config.economy.currency} at some point`,
    emoji: ":cyclone:",
    scan: async () => {
      const users = (await database.all(`SELECT * FROM economy;`)) as Economy[];
      const aquired = await getAllAquiredBadges();

      for (const user of users) {
        if (
          user.balance > 5000 &&
          !aquired.find(
            (x) => x.user === user.user_id && x.badge_name === "5kmoney"
          )
        )
          await addBadgeFor(user.user_id, "5kmoney");
      }
    },
  },
  bumper: {
    name: "Bumper",
    description: "Bumped the server 15 times",
    emoji: ":right_facing_fist:",
    scan: async () => {
      const users = (await database.all(
        `SELECT * FROM user_data;`
      )) as UserData[];
      const aquired = await getAllAquiredBadges();

      for (const user of users) {
        if (
          user.bumps >= 15 &&
          !aquired.find(
            (x) => x.user === user.user_id && x.badge_name === "bumper"
          )
        )
          await addBadgeFor(user.user_id, "bumper");
      }
    },
  },
  og: {
    name: "Founder",
    description: "Joined the server before 100 members",
    emoji: ":snowflake:",
    scan: async () => {
      return;
    },
  },
  mythiccard: {
    name: "Mythic Card",
    description: "Got a mythic card at some point",
    emoji: ":flower_playing_cards:",
    scan: async () => {
      const cards = (await database.all(
        `SELECT * FROM aquired_cards WHERE card_id IN (SELECT id FROM cards WHERE rarity = 'mythic');`
      )) as AquiredCard[];
      const aquired = await getAllAquiredBadges();

      for (const card of cards) {
        if (
          !aquired.find(
            (x) => x.user === card.user_id && x.badge_name === "mythiccard"
          )
        )
          await addBadgeFor(card.user_id, "mythiccard");
      }
    },
  },
  "eco#1": {
    name: "Economy #1",
    description: "At economy position #1",
    emoji: ":first_place:",
    scan: handleEcoPositionalBadges,
  },
  "eco#2": {
    name: "Economy #2",
    description: "At economy position #2",
    emoji: ":second_place:",
    scan: () => {},
  },
  "eco#3": {
    name: "Economy #3",
    description: "At economy position #3",
    emoji: ":third_place:",
    scan: () => {},
  },
} as const;

export default badges;

export function checkBadges() {
  for (const i in badges) {
    badges[i].scan();
  }
}

export function formatBadges(
  badges: Badge[] | { [key: string]: Badge }
): string[] {
  let result = [];

  for (let i in badges) {
    result.push(
      `${badges[i].emoji} \`${badges[i].name}\`: ${badges[i].description}`
    );
  }

  return result;
}

export function formatAquiredBadges(aquiredBadges: AquiredBadge[]): string[] {
  return formatBadges(aquiredBadges.map((x) => badges[x.badge_name]));
}
