import { Database } from "sqlite";
import ecoConfig from "../../ecoConfig";
import { HypnoCommand } from "../../types/util";
import ConfirmAction from "../../util/components/Confirm";
import { actions, database } from "../../util/database";
import { currency } from "../../util/language";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "unbancount",
  type: "counting",
  description: "Buy an unban from counting",

  handler: async (message, { userData, economy }) => {
    if (!userData.count_banned)
      return message.reply(`You have not been banned from counting!`);
    if (economy.balance < ecoConfig.counting.unban)
      return message.reply(
        `You do not have ${currency(ecoConfig.counting.unban)}`,
      );

    ConfirmAction({
      message,
      embed: createEmbed()
        .setTitle("Confirm")
        .setDescription(
          `Are you sure you want to buy a counting unban for ${currency(ecoConfig.counting.unban)}`,
        ),
      async callback() {
        await actions.eco.removeMoneyFor(
          message.author.id,
          ecoConfig.counting.unban,
        );
        await database.run(
          `UPDATE user_data SET count_banned = false WHERE user_id = ? AND guild_id = ?`,
          message.author.id,
          message.guild.id,
        );

        return {
          embeds: [],
          content: `You bought a counting unban for ${currency(ecoConfig.counting.unban)}`,
        };
      },
    });
  },
};

export default command;
