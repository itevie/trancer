import { existsSync, readFileSync, writeFileSync } from "fs";
import { actions } from "../util/database";
import { client } from "..";
import { TextChannel } from "discord.js";
import { createEmbed } from "../util/other";
import { msToHowLong } from "../util/ms";
import ecoConfig from "../ecoConfig";
import { currency } from "../util/language";
import Manager from "./Manager";
import config from "../config";
import StateConfig from "../models/StateConfig";

export const lotteryFileLocation = config.dataDirectory + "/lottery.txt";

/*class LotteryManager extends Manager {
  public name: "lottery";

  public async init() {
    if (!ecoConfig.lottery.enabled) return false;

    if (!existsSync(lotteryFileLocation))
      writeFileSync(lotteryFileLocation, new Date(0).toISOString());

    return true;
  }
}

const lotteryManager = new LotteryManager();
export default lotteryManager;*/

export async function initLottery() {
  if (!ecoConfig.lottery.enabled) return;
}

export async function checkLottery() {
  const lastStartTime = (await StateConfig.fetch()).lastLottery;
  if (ecoConfig.lottery.length - (Date.now() - lastStartTime.getTime()) > 0)
    return;

  // Get people who bought it
  const items = await actions.items.aquired.get(
    (await actions.items.getByName("lottery-ticket")).id,
  );
  const userIDs: string[] = items.reduce(
    (p, c) => [...p, ...Array(c.amount).fill(c.user_id)],
    [] as string[],
  );
  let prize: number = items.reduce(
    (p, c) => p + ecoConfig.lottery.entryPrice * c.amount,
    ecoConfig.lottery.basePool,
  );

  // Pick winner
  let winner =
    userIDs.length === 0
      ? null
      : await client.users.fetch(
          userIDs[Math.floor(Math.random() * userIDs.length)],
        );

  writeFileSync(lotteryFileLocation, new Date().toISOString());

  const channel = (await client.channels.fetch(
    ecoConfig.lottery.announcementChannel,
  )) as TextChannel;
  await channel.send({
    content: "<@&1280494604432707585>",
    embeds: [
      createEmbed()
        .setTitle("Lottery")
        .setDescription(
          `The lottery has ended!\n${
            winner === null
              ? "There were no entries, so there was no winner."
              : `There were **${
                  userIDs.length
                }** entries with a prize pool of ${currency(
                  prize,
                )}, and... ||**${winner.username}**|| won!!`
          }`,
        )
        .addFields([
          {
            name: "Enter",
            value: `To enter the new lottery, buy a lottery ticket with \`.buy lottery-ticket\`!\nThe winner will be drawn in **${msToHowLong(
              ecoConfig.lottery.length,
            )}**!`,
          },
        ]),
    ],
  });

  if (!winner) return;

  // Remove items
  for await (const ai of items) {
    await actions.items.aquired.removeFor(ai.user_id, ai.item_id, ai.amount);
  }

  // Award
  await actions.eco.addMoneyFor(winner.id, prize, "gambling");
}
