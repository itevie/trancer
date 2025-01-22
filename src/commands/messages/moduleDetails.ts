import { handlers } from "../..";
import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "module",
  description: "Get details on a module",
  type: "messages",

  handler: (message, { oldArgs: args }) => {
    if (!args[0]) return message.reply(`Please provide a module name`);
    const arg = args[0].toLowerCase();
    const module = handlers.find((x) => x.name === arg);

    if (!module) return message.reply(`Couldn't find a module with that name`);

    return message.reply({
      embeds: [
        createEmbed()
          .setTitle(`Message Handler: ${module.name}`)
          .setDescription(module.description)
          .addFields([
            {
              name: "Features",
              value: !module.examples
                ? "*None Listed*"
                : module.examples.join("\n"),
            },
          ]),
      ],
    });
  },
};

export default command;
