import { client } from "..";
import { HypnoMessageHandler } from "../types/util";
import { actions, database } from "../util/database";
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
    .replace(/to the power of 2/g, "^2")
    .replace(/to the power of 3/g, "^3")
    .replace(/to the power of 4/g, "^4")
    .replace(/to the power of 5/g, "^5");
}

const handler: HypnoMessageHandler = {
  name: "counter",
  description: "Detects and updates the counting feature in a server",

  handler: async (message) => {
    // Get count & do guards
    let count = await actions.serverCount.getFor(message.guild.id);
    if (!count) return;
    if (message.channel.id !== count.channel_id) return;

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

    if (count.last_counter === message.author.id)
      return message.reply(
        `You cannot count twice in a row - wait for someone else!`,
      );

    // Check if it is expected
    if (number !== count.current_count + 1) {
      await database.run(
        `UPDATE server_count SET current_count = 0 WHERE server_id = ?`,
        message.guild.id,
      );
      await database.run(
        `UPDATE user_data SET count_ruined = count_ruined + 1 WHERE user_id = ? AND guild_id = ?;`,
        message.author.id,
        message.guild.id,
      );
      await message.react(`❌`);
      return message.reply({
        embeds: [
          createEmbed()
            .setTitle("Count ruined!")
            .setDescription(
              `<@${
                message.author.id
              }> ruined the count! The next number was **${
                count.current_count + 1
              }**\n\nThe count has been reset, next number is **1**`,
            )
            .setColor(`#FF0000`),
        ],
      });
    }

    // Check if it is the highest
    if (number > count.highest_count)
      await database.run(
        `UPDATE server_count SET highest_count = ? WHERE server_id = ?`,
        number,
        message.guild.id,
      );

    // Update & add reaction
    await database.run(
      `UPDATE server_count SET current_count = current_count + 1 WHERE server_id = ?`,
      message.guild.id,
    );
    await database.run(
      `UPDATE server_count SET last_counter = ? WHERE server_id = ?`,
      message.author.id,
      message.guild.id,
    );
    await message.react(number < count.highest_count ? `✅` : "☑️");
  },
};

export default handler;
