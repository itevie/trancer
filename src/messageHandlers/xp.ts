import { Message } from "discord.js";
import config from "../config";
import { HypnoMessageHandler } from "../types/util";
import { addRole, englishifyList, randomFromRange } from "../util/other";
import { actions } from "../util/database";
import { b, currency } from "../util/language";
import LevelRole from "../models/LevelRole";

const exclude = [
  "1257420480953057321",
  "1257417475621130351",
  "1257426818479161394",
];

export const levels = [
  25, 50, 75, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1200,
  1400, 1600, 1800, 2000, 2500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500,
  9000, 9500, 10000, 11000,
];
export const after = levels[levels.length - 1] - levels[levels.length - 2];

export const minXP = 0;
export const maxXP = 5;
export const timeBetween = 120000;
export const xpEcoReward = 100;

const lastAwards: { [key: string]: number } = {};

const handler: HypnoMessageHandler = {
  name: "xp",
  description: "Gives XP to the message author",

  handler: async (message) => {
    let settings = await actions.serverSettings.getFor(message.guild.id);

    if (exclude.includes(message.channel.id)) return;
    if (
      lastAwards[`${message.author.id}-${message.channel.id}`] &&
      timeBetween -
        (Date.now() -
          lastAwards[`${message.author.id}-${message.channel.id}`]) >
        0
    )
      return;

    lastAwards[`${message.author.id}-${message.channel.id}`] = Date.now();

    let data = await actions.userData.getFor(
      message.author.id,
      message.guild.id,
    );
    let pre = calculateLevel(data.xp);

    let award = randomFromRange(minXP, maxXP);
    await actions.userData.incrementFor(
      message.author.id,
      message.guild.id,
      "xp",
      award,
    );

    let post = calculateLevel(data.xp + award);

    if (pre !== post && settings.level_notifications) {
      let reward: string[] = [];

      // Check if they should get economy in Twilight
      if (message.guild.id === config.botServer.id) {
        const amount = xpEcoReward * (post / 2);
        reward.push(currency(amount));
        await actions.eco.addMoneyFor(message.author.id, amount, "messaging");
      }

      // Check if there is a level role
      let levelRole = await LevelRole.fetchByLevel(message.guild.id, post);
      if (!!levelRole) {
        try {
          let role = await message.guild.roles.fetch(levelRole.data.role_id);
          await addRole(message.member, role);
          reward.push(`role ${role.name}`);
        } catch (e) {
          // TODO: Handle error here, show it to the author somehow
          console.log(e);
        }
      }

      try {
        await message.reply(
          `Welldone! You levelled up from level ${b(pre)} to ${b(post)}! :cyclone` +
            (reward ? `\n\n${englishifyList(reward)}` : ""),
        );
      } catch {}
    }
  },
};

export default handler;

export function xpForNextLevel(xp: number): number {
  let level = calculateLevel(xp);
  let next = getXPForLevel(level + 1);
  return next - xp;
}

export function getXPForLevel(level: number): number {
  if (level < 0) return levels[0];
  if (levels.length - 1 > level) return levels[level];
  let last = levels.length - 1;
  let lvl = levels[last];
  return lvl + (level - last) * after;
}

export function calculateLevel(xp: number): number {
  let level = 0;
  let temp = 0;

  for (let l of levels) {
    if (xp >= l) {
      level++;
    }
  }

  if (xp > levels[levels.length - 1]) {
    temp = xp - levels[levels.length - 1];
  }

  if (temp > 0) level += parseInt((temp / after).toFixed(0));
  return level + 1;
}
