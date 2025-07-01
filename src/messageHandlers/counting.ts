import ServerCount from "../models/ServerCount";
import { HypnoMessageHandler } from "../types/util";
import { actions } from "../util/database";
import { createEmbed } from "../util/other";
import Mexp from "math-expression-evaluator";
import wordsToNumbers from "words-to-numbers";

export function fixMathExpr(content: string) {
  content = wordsToNumbers(content).toString();
  return content
    .replace(/|/g, "")
    .replace(/[×x]/g, "*")
    .replace(/[÷]/, "/")
    .replace(/²/g, "^2")
    .replace(/plus/g, "+")
    .replace(/minus/g, "-")
    .replace(/times/g, "*")
    .replace(/multiplied by/g, "*")
    .replace(/divided by/g, "/")
    .replace(/to the power of/g, "^");
}

const handler: HypnoMessageHandler = {
  name: "counter",
  description: "Detects and updates the counting feature in a server",

  handler: async (message) => {
    // Get count & do guards
    let count = await ServerCount.get(message.guild.id);
    if (!count) return;
    if (message.channel.id !== count.data.channel_id) return;

    let userData = await actions.userData.getFor(
      message.author.id,
      message.guild.id,
    );

    // Check if it contains a number
    let number: number | null = null;
    try {
      if (message.reference) {
        const ref = await message.fetchReference();
        message.content = message.content
          .replace(/that/gi, ref.content)
          .replace(/ans(wer)?/gi, ref.content);
      }
      number = new Mexp().eval(fixMathExpr(message.content));
    } catch {
      return;
    }

    if (userData.count_banned)
      return message.reply(
        `:x: This is not counted as you're too bad at counting. (Ruined count 5 times - count banned)`,
      );

    // if (count.data.last_counter === message.author.id)
    //   return message.reply(
    //     `You cannot count twice in a row - wait for someone else!`,
    //   );

    // Check if it is expected
    if (number !== count.data.current_count + 1) {
      if (
        count.data.ignore_failure ||
        (count.data.ignore_failure_weekends &&
          [0, 6].includes(new Date().getDay()))
      ) {
        await message.react(`❌`);
        return;
      }
      await count.ruined(message.author.id, message);

      await message.react(`❌`);
      return message.reply({
        embeds: [
          createEmbed()
            .setTitle("Count ruined!")
            .setDescription(
              `<@${
                message.author.id
              }> ruined the count! The next number was **${
                count.data.current_count + 1
              }**\n\nThe count has been reset, next number is **1**`,
            )
            .setColor(`#FF0000`),
        ],
      });
    }

    // Update & add reaction
    await count.increase(message.author.id);
    await message.react(number < count.data.highest_count ? `✅` : "☑️");
  },
};

export default handler;
