import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { randomFromRange } from "../../util/other";

const command: HypnoCommand<{ user?: User }> = {
  name: "hypno",
  type: "fun",
  description: "Hypno someone :cyclone:",

  args: {
    requiredArguments: 0,
    args: [
      {
        type: "user",
        name: "user",
      },
    ],
  },

  handler: async (message, { args }) => {
    let user = args.user;

    if (!user && message.reference) {
      user = (await message.fetchReference()).author;
    }

    if (!user) {
      return message.reply(
        `Hypnosis is cool... but who are you tryna hypnotise?`
      );
    }

    if (user.id === message.author.id) {
      return message.reply(
        `Love a bit of self hypnosis... your hypnotised yourself and it was **${randomFromRange(
          0,
          100
        )}%** successful! :cyclone:`
      );
    }

    return message.reply(
      `**${user.username}** are you ready... to be hypnotised, by **${
        message.author.username
      }**... because they hypnotise you with **${randomFromRange(
        0,
        100
      )}%** power!`
    );
  },
};

export default command;
