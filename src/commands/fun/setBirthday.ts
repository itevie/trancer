import { HypnoCommand } from "../../types/util";
import ConfirmAction from "../../util/components/Confirm";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ birthday: string }> = {
  name: "setbirthday",
  description: "Set your birthday!",
  type: "fun",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "birthday",
        type: "string",
        description: "Your birthday",
      },
    ],
  },

  handler: async (message, { args }) => {
    if (!args.birthday.match(/^((\d{4}\/)?\d{1,2}\/\d{1,2})$/)) {
      return message.reply(
        `Invalid date format! Please give your birthday in the YYYY/MM/DD format (or MM/DD)!`,
      );
    }

    let parts = args.birthday.split("/").map((x) => parseInt(x));

    let birthday =
      parts.length === 3
        ? { year: parts[0], month: parts[1], day: parts[2] }
        : { month: parts[0], day: parts[1] };

    if (birthday.month <= 0 || birthday.month > 12)
      return message.reply(`Hey! ${birthday.month} isn't a real month...`);
    if (birthday.day <= 0 || birthday.day > 31)
      return message.reply(`Hey! ${birthday.day} isn't a real day...`);

    let date = new Date(
      `${birthday.year || 2024}/${birthday.month}/${birthday.day}`,
    );

    ConfirmAction({
      message,
      embed: createEmbed()
        .setTitle("Is this your birthday?")
        .setDescription(date.toDateString()),
      async callback() {
        await actions.userData.updateFor(
          message.author.id,
          message.guild.id,
          "birthday",
          `${birthday.year || "????"}/${date.getMonth() + 1}/${date.getDate()}`,
        );
        return {
          embeds: [],
          content: `Your birthday has been set to **${date.toDateString()}**`,
        };
      },
    });
  },
};

export default command;
