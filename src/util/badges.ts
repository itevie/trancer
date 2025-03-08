import { AquiredBadge } from "../types/aquiredBadge";
import { actions, database } from "./database";
import config from "../config";
import { calculateLevel } from "../messageHandlers/xp";
import { currency } from "./textProducer";
import { Message } from "discord.js";
import { createEmbed } from "./other";

export interface Badge {
  name: string;
  description: string;
  emoji: string;
  scan: (user: UserData & Economy) => Promise<boolean>;
}

async function handleEcoPositionalBadges() {
  let economy = (await actions.eco.getAll()).sort(
    (a, b) => b.balance - a.balance
  );
  let badges = await actions.badges.aquired.getAll();

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
    await actions.badges.removeFor(dbFirst, "eco#1");
    await actions.badges.addFor(first, "eco#1");
  }

  if (second !== dbSecond) {
    await actions.badges.removeFor(dbSecond, "eco#2");
    await actions.badges.addFor(second, "eco#2");
  }

  if (third !== dbThird) {
    await actions.badges.removeFor(dbThird, "eco#3");
    await actions.badges.addFor(third, "eco#3");
  }

  return false;
}

const badges: { [key: string]: Badge } = {
  yapper: {
    name: "Yapper",
    description: "Sent 1000 messages",
    emoji: ":speaking_head:",
    scan: async (user) => {
      return user.messages_sent > 1000;
    },
  },
  yapper2: {
    name: "Mega Yapper",
    description: "Sent 10,000 messages",
    emoji: ":loud_sound:",
    scan: async (user) => {
      return user.messages_sent > 10_000;
    },
  },
  level15: {
    name: "Level 15",
    description: "Get to level 15",
    emoji: ":chart_with_upwards_trend:",
    scan: async (user) => {
      return calculateLevel(user.xp || 0) >= 15;
    },
  },
  level30: {
    name: "Level 30",
    description: "Get to level 30",
    emoji: ":fire:",
    scan: async (user) => {
      return calculateLevel(user.xp || 0) >= 30;
    },
  },
  botfuckerupper: {
    name: "Bot Fucker Upper",
    description: "Broke the bot (like found a glitch)",
    emoji: ":sob:",
    scan: async () => {
      return false;
    },
  },
  "500vcminutes": {
    name: "500 VC Minutes",
    description: "Been in a VC for 500 minutes (about 8 hours)",
    emoji: ":telephone_receiver:",
    scan: async (user) => {
      return user.vc_time > 500;
    },
  },
  "5kmoney": {
    name: "Money Maker",
    description: `Reached ${currency(5000)} at some point`,
    emoji: ":cyclone:",
    scan: async (user) => {
      return user.balance > 5000;
    },
  },
  bumper: {
    name: "Bumper",
    description: "Bumped the server 15 times",
    emoji: ":right_facing_fist:",
    scan: async (user) => {
      return user.bumps >= 15;
    },
  },
  og: {
    name: "Founder",
    description: "Joined the server before 100 members",
    emoji: ":snowflake:",
    scan: async () => {
      return false;
    },
  },
  mythiccard: {
    name: "Mythic Card",
    description: "Got a mythic card at some point",
    emoji: ":flower_playing_cards:",
    scan: async (user) => {
      const cards = (await database.all(
        `SELECT * FROM aquired_cards WHERE user_id = ? AND card_id IN (SELECT id FROM cards WHERE rarity = 'mythic');`,
        user.user_id
      )) as AquiredCard[];

      return cards.length > 0;
    },
  },
  cult: {
    name: "Cult Leader",
    description: "Get 5 people to worship you with the tree feature",
    emoji: ":pray:",
    scan: async (user) => {
      const amount = await actions.relationships.getFor(
        user.user_id,
        "worships"
      );
      return amount.length >= 5;
    },
  },
  "eco#1": {
    name: "Economy #1",
    description: "At economy position #1",
    emoji: ":first_place:",
    scan: async () => {
      return false;
    },
  },
  "eco#2": {
    name: "Economy #2",
    description: "At economy position #2",
    emoji: ":second_place:",
    scan: async () => {
      return false;
    },
  },
  "eco#3": {
    name: "Economy #3",
    description: "At economy position #3",
    emoji: ":third_place:",
    scan: async () => {
      return false;
    },
  },
} as const;

export default badges;

export async function checkBadges(
  message?: Message<true>,
  data?: UserData & Economy
) {
  const users = data
    ? [data]
    : await database.all<(UserData & Economy)[]>(
        `SELECT 
     user_data.*, 
     economy.balance
   FROM 
     user_data 
   INNER JOIN 
     economy 
   ON 
     user_data.user_id = economy.user_id 
   WHERE 
     user_data.guild_id = ?;`,
        config.botServer.id
      );

  const given: Badge[] = [];

  for await (const user of users) {
    for await (const [k, badge] of Object.entries(badges)) {
      const result = await badge.scan(user);
      if (result) {
        const giveResult = await actions.badges.addFor(user.user_id, k);
        if (giveResult) given.push(badge);
      }
    }
  }

  if (given.length > 0 && message) {
    await message.reply({
      embeds: [
        createEmbed()
          .setTitle("You got the following badges!")
          .setDescription(
            given
              .map((x) => `${x.emoji} **${x.name}**: ${x.description}`)
              .join("\n")
          ),
      ],
    });
  }

  handleEcoPositionalBadges();
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
