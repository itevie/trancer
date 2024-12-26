import { existsSync, readFileSync, writeFileSync } from "fs";
import config from "../config";
import { actions } from "./database";
import { client } from "..";
import { TextChannel } from "discord.js";
import { createEmbed } from "./other";
import { msToHowLong } from "./ms";
import { addMoneyFor } from "./actions/economy";

const lotteryFileLocation = __dirname + "/../../lottery.txt";

export async function initLottery() {
  if (!config.lottery.enabled) return;

  if (!existsSync(lotteryFileLocation))
    writeFileSync(lotteryFileLocation, new Date(0).toISOString());

  setInterval(() => {
    checkLottery();
  }, 1000);
}

async function checkLottery() {
  const lastStartTime = new Date(readFileSync(lotteryFileLocation, "utf-8"));
  if (config.lottery.length - (Date.now() - lastStartTime.getTime()) > 0)
    return;

  // Get people who bought it
  const items = await actions.items.aquired.get(
    (
      await actions.items.getByName("lottery-ticket")
    ).id
  );
  const userIDs: string[] = items.reduce(
    (p, c) => [...p, ...Array(c.amount).fill(c.user_id)],
    [] as string[]
  );
  let prize: number = items.reduce(
    (p, c) => p + config.lottery.entryPrice * c.amount,
    0
  );

  // Pick winner
  let winner =
    userIDs.length === 0
      ? null
      : await client.users.fetch(
          userIDs[Math.floor(Math.random() * userIDs.length)]
        );

  const channel = (await client.channels.fetch(
    config.lottery.announcementChannel
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
              : `There were **${userIDs.length}** entries with a prize pool of **${prize}${config.economy.currency}**, and... ||**${winner.username}**|| won!!`
          }`
        )
        .addFields([
          {
            name: "Enter",
            value: `To enter the new lottery, buy a lottery ticket with \`.buy lottery-ticket\`!\nThe winner will be drawn in **${msToHowLong(
              config.lottery.length
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
  await addMoneyFor(winner.id, prize, "gambling");
  writeFileSync(lotteryFileLocation, new Date().toISOString());
}
