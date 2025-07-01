import { HypnoCommand } from "../../types/util";
import { getMessageAtTimes } from "../../util/analytics";
import { units } from "../../util/ms";
import { generateMultilineDataGraph, graphArgs } from "../../util/charts";

const command: HypnoCommand = {
  name: "messageovertime",
  aliases: ["messagesover", "msgover"],
  type: "analytics",
  description: `Get a graph of the messages in every minute overtime`,
  ratelimit: units.second * 30,

  args: {
    requiredArguments: 0,
    args: [...graphArgs],
  },

  handler: async (message, { args }) => {
    let messages = await getMessageAtTimes();

    let graph = await generateMultilineDataGraph({
      data: messages.map(
        (x) => ["message", new Date(x.time), x.amount] as const,
      ),
      ...args,
    });

    return message.reply({
      files: [graph],
    });
  },
};

export default command;
