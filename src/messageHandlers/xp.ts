import { Message } from "discord.js";
import config from "../config";
import { HypnoMessageHandler } from "../types/util";
import { addXP, getUserData } from "../util/actions/userData";
import { randomFromRange } from "../util/other";

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

export const rewards: {
  [key: number]: { handle: (messge: Message<boolean>) => void; label: string };
} = {
  5: {
    handle: async (message) => {
      await message.member.roles.add(config.botServer.roles.canRequest);
    },
    label: `You can now request sub/tist/DMs!`,
  },
};

const minXP = 0;
const maxXP = 5;
const timeBetween = 120000;

const lastAwards: { [key: string]: number } = {};

const handler: HypnoMessageHandler = {
  name: "xp",
  description: "Awards XP",

  handler: async (message) => {
    if (exclude.includes(message.channel.id)) return;
    if (message.guild.id !== config.botServer.id) return;
    if (
      lastAwards[message.author.id] &&
      timeBetween - (Date.now() - lastAwards[message.author.id]) > 0
    )
      return;

    lastAwards[message.author.id] = Date.now();

    let data = await getUserData(message.author.id, message.guild.id);
    let pre = calculateLevel(data.xp);

    let award = randomFromRange(minXP, maxXP);
    await addXP(message.author.id, message.guild.id, award);

    let post = calculateLevel(data.xp + award);

    if (pre !== post) {
      let reward = rewards[post];
      if (reward) await reward.handle(message);
      await message.reply(
        `Welldone! You levelled up from level **${pre}** to **${post}**! :cyclone:${
          reward ? `\n\n${reward.label}` : ""
        }`
      );
    }
  },
};

export default handler;

export function calculateLevel(xp: number): number {
  let level = 0;
  let temp = xp;

  for (let l of levels) {
    if (xp >= l) {
      level++;
      temp -= l;
    }
  }

  if (temp > 0) level += parseInt((temp / after).toFixed(0));
  return level + 1;
}
