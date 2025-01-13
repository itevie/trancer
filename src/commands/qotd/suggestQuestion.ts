import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand<{ question: string }> = {
  name: "suggestquestion",
  type: "qotd",
  aliases: ["squestion", "suggestq"],
  description: "Add a question to the QOTD queue",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "question",
        type: "string",
        takeContent: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    // Validate
    if (args.question.length < 10 || args.question.length > 100)
      return message.reply(
        `:warning: Your question must be between **10** and **100** characters long.`
      );
    if (await actions.qotd.questionExists(args.question, message.guild.id))
      return message.reply(`:warning: That question has already been added.`);

    // Add it
    await actions.qotd.addQuestion(
      args.question,
      message.guild.id,
      message.author.id
    );

    return message.reply(`Question added! Thanks :cyclone:`);
  },
};

export default command;
