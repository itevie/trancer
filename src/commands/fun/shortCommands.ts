import { commands } from "../..";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand<{ length?: number }> = {
  name: "shortcommands",
  type: "fun",
  description: "Get a list of all the 3 letter or below command names",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "length",
        type: "wholepositivenumber",
      },
    ],
  },

  handler: (message, args) => {
    let aliases: string[] = [];

    for (const i in commands) {
      for (const alias of commands[i]?.aliases || []) {
        if (alias.length < (args.args.length ? args.args.length : 3) + 1)
          if (!aliases.includes(alias)) aliases.push(alias);
      }
    }

    return message.reply(aliases.map((x) => `\`${x}\``).join(", "));
  },
};

export default command;
