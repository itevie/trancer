import message from "../../topics/help-cards";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import statusThemes from "./_util";

const command: HypnoCommand<{ theme: string }> = {
  name: "setstatustheme",
  description: "Sets the theme of the .setstatus command in your server",
  type: "hypnosis",
  guards: ["admin"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "theme",
        type: "string",
        oneOf: Object.keys(statusThemes),
      },
    ],
  },

  handler: async (message, { args }) => {
    await actions.serverSettings.update(
      message.guild.id,
      "status_theme",
      args.theme
    );
    return message.reply(
      `Updated status theme to **${args.theme}**! ${Object.values(
        statusThemes[args.theme]
      ).join("")}`
    );
  },
};

export default command;
