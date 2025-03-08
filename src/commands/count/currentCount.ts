import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand = {
  name: "currentcount",
  aliases: ["highestcount"],
  type: "counting",
  description:
    "Get the expected next number in the count and the highest number",

  handler: async (message) => {
    let count = await actions.serverCount.getFor(message.guild.id);
    if (!count) {
      return message.reply(
        `This server does not have counting enabled... but what if it did?`
      );
    }

    return message.reply(
      `The **next** expected number is **${
        count.current_count + 1
      }**\nThe **highest** count is **${count.highest_count}**`
    );
  },
};

export default command;
