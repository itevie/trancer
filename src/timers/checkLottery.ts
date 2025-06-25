import { TextChannel } from "discord.js";
import { writeFileSync } from "fs";
import { client } from "..";
import ecoConfig from "../ecoConfig";
import StateConfig from "../models/StateConfig";
import { actions } from "../util/database";
import { currency } from "../util/language";
import { msToHowLong, units } from "../util/ms";
import { createEmbed } from "../util/other";
import { Timer } from "./timer";

const timer: Timer = {
  name: "check-lottery",
  every: units.hour,
  execute: async () => {
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

    await StateConfig.set("last_lottery", new Date().toISOString());

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
  },
};

export default timer;
