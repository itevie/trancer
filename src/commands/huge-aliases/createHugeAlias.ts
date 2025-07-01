import { commands } from "../..";
import HugeAlias from "../../models/HugeAlias";
import { HypnoCommand } from "../../types/util";
import ConfirmAction from "../../util/components/Confirm";
import { tick } from "../../util/language";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ command: string; result: string }> = {
  name: "setalias",
  aliases: ["sethugealias", "createalias", "createhugealias"],
  description:
    "Set a huge alias. You can make one simple command run a huge command with all the arguments!" +
    "\n\nYou can also use the arguments when running it. For example you could make `.x @user` run `.ttt @user`, this is done by defining `x` as `ttt $1$`" +
    "\n\nEach $x$ (where x is where in the running command it appears) will be replaced!",
  type: "booster",

  guards: ["twilight-booster"],

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "command",
        type: "string",
        description: "The command you type to run it",
      },
      {
        name: "result",
        type: "string",
        description: "The command that will be ran when you run this",
        takeRest: true,
      },
    ],
  },

  handler: async (message, { args, serverSettings }) => {
    const old = await HugeAlias.fetch(message.author.id, args.command);

    if (commands[args.command])
      return {
        content: `Sorry, but there is already a Trancer command with that name...`,
      };

    if (old !== null)
      ConfirmAction({
        message,
        embed: createEmbed()
          .setTitle("You already have that alias!")
          .setDescription(
            `It runs: ${tick(old.data.result)}, do you want to replace it?`,
          ),
        callback: async () => {
          await old.delete();
          await HugeAlias.create(message.author.id, args.command, args.result);
          return {
            embeds: [],
            content: "Sucess! It has been overwritten!",
          };
        },
      });
    else {
      await HugeAlias.create(message.author.id, args.command, args.result);
      return {
        content: `Created the huge alias! Try it out: ${tick(serverSettings.prefix + args.command)}`,
      };
    }
  },
};

export default command;
