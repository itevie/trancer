import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ asked?: boolean }> = {
  name: "questions",
  type: "qotd",
  description: "Get a list of questions for the QOTD",

  handler: async (message) => {
    return paginate({
      message: message,
      embed: createEmbed().setTitle("Questions for QOTD"),
      type: "description",
      data: (await actions.qotd.getQuestions(message.guild.id)).map(
        (x) =>
          `**${x.id}**: ${x.question} *[${x.asked ? "asked" : "not asked"}]*`,
      ),
    });
  },
};

export default command;
