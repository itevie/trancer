import { calculateLevel } from "../../messageHandlers/xp";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { jobs } from "./_jobs";

const command: HypnoCommand<{ job: keyof typeof jobs }> = {
  name: "job",
  description: "Select a job for working",
  type: "economy",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "job",
        type: "string",
        oneOf: Object.keys(jobs),
        takeContent: true,
      },
    ],
  },

  handler: async (message, { args, economy }) => {
    const level = calculateLevel(economy.work_xp);
    const job = jobs[args.job];

    if (args.job === economy.job)
      return message.reply(`That is already your job!`);

    if (job.levelRequired > level)
      return message.reply(
        `You need to be level **${job.levelRequired}** in work but you are only level **${level}**!`,
      );

    await actions.eco.setJob(message.author.id, args.job);
    return message.reply(`You set your job to **${args.job}**! 🎉`);
  },
};

export default command;
