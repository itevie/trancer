import { HypnoCommand } from "../../types/util";

const command: HypnoCommand<{ messages?: number }> = {
  name: "here",
  description: "Get a user in the current conversation",
  type: "fun",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "messages",
        type: "wholepositivenumber",
        description: "How many messages to look back at to pick a random one",
      },
    ],
  },

  handler: async (message, { args }) => {
    const users = (
      await message.channel.messages.fetch({
        limit: args.messages ?? 30,
      })
    ).map((x) => x.author.id);

    return message.reply(
      `<@${users[Math.floor(Math.random() * users.length)]}>`,
    );
  },
};

export default command;
