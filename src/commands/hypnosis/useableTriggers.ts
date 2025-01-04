import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand<{ other?: boolean }> = {
  name: "useabletriggers",
  description: "Give a list of triggers that can currently be used",
  type: "hypnosis",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "other",
        type: "boolean",
        description:
          "Whether or not to simulate it's being used by someone else",
        wickStyle: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const userData = await actions.userData.getFor(
      message.author.id,
      message.guild.id
    );
    const impos = await actions.triggers.getList(message.author.id, [
      userData.hypno_status,
      args.other ? "by others" : null,
    ]);
    return message.reply(
      impos.map((x) => x.what).join("\n") || "*No Triggers*"
    );
  },
};

export default command;
