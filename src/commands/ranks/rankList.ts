import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";

const command: HypnoCommand = {
  name: "ranklist",
  aliases: ["rankl", "rl"],
  type: "ranks",
  description: "Get a list of active ranks",

  handler: async (message) => {
    const ranks = (await database.all(`SELECT rank_name FROM ranks;`)).map(
      (x) => x.rank_name
    );
    return message.reply(
      `Here are the ranks you can vote on: ${ranks
        .map((x) => `**${x}**`)
        .join(", ")}`
    );
  },
};

export default command;
