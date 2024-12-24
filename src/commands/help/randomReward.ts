import { HypnoCommand } from "../../types/util";
import { getItems } from "../../util/actions/items";
import {
  englishifyRewardDetails,
  generateRandomReward,
} from "../../util/economy";

const command: HypnoCommand<{
  itemtag?: string;
  minitems?: number;
  maxitems?: number;
}> = {
  name: "randomreward",
  type: "help",
  description: "Debug command",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "itemtag",
        type: "string",
        wickStyle: true,
      },
      {
        name: "minitems",
        type: "wholepositivenumber",
        wickStyle: true,
      },
      {
        name: "maxitems",
        type: "wholepositivenumber",
        wickStyle: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    let items = await getItems();
    if (args.itemtag) items = items.filter((x) => x.tag === args.itemtag);

    const reward = await generateRandomReward({
      items: {
        pool: Object.fromEntries(items.map((x) => [x.id, x.weight])),
        count: {
          min: args.minitems || 0,
          max: args.maxitems || 5,
        },
      },
    });

    return message.reply(await englishifyRewardDetails(reward));
  },
};

export default command;
