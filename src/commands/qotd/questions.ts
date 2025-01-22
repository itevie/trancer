import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { createEmbed, paginate } from "../../util/other";

const command: HypnoCommand<{ asked?: boolean }> = {
  name: "questions",
  type: "qotd",
  description: "Get a list of questions for the QOTD",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "asked",
        wickStyle: true,
        description: "Show questions that have been asked",
        type: "boolean",
      },
    ],
  },

  handler: async (message, { args }) => {
    return paginate({
      replyTo: message,
      embed: createEmbed().setTitle("Questions for QOTD"),
      type: "description",
      data: (await actions.qotd.getQuestions(message.guild.id))
        .filter((x) => !x.asked && !args.asked)
        .map(
          (x) =>
            `**${x.id}**: ${x.question} *[${x.asked ? "asked" : "not asked"}]*`
        ),
    });
  },
};

export default command;
