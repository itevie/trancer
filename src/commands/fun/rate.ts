import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { randomNumberFromString } from "../../util/other";

const command: HypnoCommand<{ what: string; user?: User }> = {
  name: "rate",
  description: "Rate someone's ___",
  type: "fun",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "user",
        type: "user",
        infer: true,
      },
      {
        name: "what",
        type: "string",
        takeRest: true,
      },
    ],
  },

  handler: (message, { args }) => {
    let user = args.user ? args.user : message.author;

    return message.reply(
      `According to my calculation... **${
        user.username
      }** is... **${createRating(user.username, args.what)}% ${args.what}**`,
    );
  },
};

export default command;

export function createRating(username: string, what: string): number {
  return randomNumberFromString(`${username}-${what}`, -5, 100);
}
