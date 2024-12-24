import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand = {
  name: "favouritespiral",
  aliases: ["fs"],
  description: "Send one of your favourite spirals",
  type: "spirals",

  handler: async (message, { oldArgs }) => {
    let spirals = await actions.spirals.favourites.getFor(message.author.id);

    // Check if list
    if (oldArgs[0] === "list") {
      return message.reply(
        `Your favourite spiral IDs are: ${spirals
          .map((x) => `**${x.id}**`)
          .join(", ")}`
      );
    }

    // Check if it has any
    if (spirals.length === 0)
      return message.reply(`You don't have any favourite spirals!`);

    // Send
    return message.reply(
      `${spirals[Math.floor(Math.random() * spirals.length)].link}`
    );
  },
};

export default command;
