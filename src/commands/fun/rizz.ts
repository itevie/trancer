import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { randomFromRange } from "../../util/other";

const command: HypnoCommand<{ user?: User }> = {
  name: "rizz",
  type: "fun",
  description: "Rizz <:bite_lips:1315469148004028537>",

  args: {
    requiredArguments: 0,
    args: [
      {
        type: "user",
        name: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    let user = args.user;

    if (!user) {
      return message.reply(
        `Damn... who you tryna rizz? Maybe you should like reply to someone <:bite_lips:1315469148004028537>`
      );
    }

    if (user.id === message.author.id) {
      return message.reply(
        `Damn... ok ok... you tryna rizz yourself up? I see it... well... it was **${randomFromRange(
          0,
          110
        )}%** effective :fire:`
      );
    }

    return message.reply(
      `Ok... **${user.username}** are you ready for... **${
        message.author.username
      }'s** amazing rizz? <:bite_lips:1315469148004028537> Well... it was... **${randomFromRange(
        0,
        110
      )}%** effective :fire:`
    );
  },
};

export default command;
