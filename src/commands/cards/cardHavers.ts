import { HypnoCommand } from "../../types/util";
import { getAllAquiredCards } from "../../util/actions/cards";

const command: HypnoCommand<{ card: Card }> = {
  name: "whohascard",
  type: "cards",
  description: "Check all the people who have a card",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "card",
        type: "card",
      },
    ],
  },

  handler: async (message, { args }) => {
    let aquired = (await getAllAquiredCards()).filter(
      (x) => x.card_id === args.card.id && x.amount > 0
    );
    let usernames: string[] = [];
    for await (const a of aquired)
      usernames.push((await message.client.users.fetch(a.user_id)).username);

    return message.reply(
      `The following people have **${args.card.name}**:\n\n${usernames.join(
        ", "
      )}`
    );
  },
};

export default command;
