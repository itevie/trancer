import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand = {
  name: "deletequote",
  aliases: ["delquote", "dquote", "dq"],
  description: "Delete a quote",
  type: "quotes",
  guards: ["admin", "bot-server"],

  handler: async (message, { oldArgs: args }) => {
    if (!args[0]) return message.reply(`Please give an ID to delete!`);
    await actions.quotes.delete(parseInt(args[0]));
    return message.reply(`Done! :cyclone:`);
  },
};

export default command;
