import { MessageCreateOptions } from "discord.js";
import { createEmbed } from "../util/other";

let message: MessageCreateOptions = {
  embeds: [
    createEmbed()
      .setTitle("Understanding Command Parameters")
      .setDescription(
        `A parameter (or argument) is a part of a command. For example, in \`$prefixprofile @john\`:` +
          `\n- **Command Name**: \`profile\`` +
          `\n- **Parameter**: \`@john\`` +
          `\n` +
          `\nParameters have "types," which define their format. Here are some examples:` +
          `\n- **string**: Any text, e.g., \`hello\` or \`123abc\`` +
          `\n- **wholepositivenumber**: A positive whole number, e.g., \`2\` or \`39\` (not \`-2\` or \`3.5\`)` +
          `\n- **user**: A user's mention or ID.`
      )
      .addFields([
        {
          name: "Inferred Parameters",
          value:
            `Some commands can "infer" a parameter from a reply. For example, if a "user" parameter is inferred and you reply to a message, the parameter will be set to the reply's author.` +
            `\n` +
            `\n**Example:** Replying to John's message with \`$prefixprofile\` sets the user parameter to \`@john\`.`,
        },
        {
          name: "Explicit Parameters",
          value:
            `Explicit parameters require naming them with a \`?\` prefix. They are always optional and must come at the end of a command.` +
            `\n` +
            `\n**Example:** For a \`$prefixprofile\` command with an explicit \`full\` parameter, you can run:` +
            `\n- \`$prefixprofile @john ?full\`` +
            `\n` +
            `\nAnother example:` +
            `\n\`$prefixprofile @john ?test test ?meow\` parses as:` +
            `\n- Command Name: \`profile\`` +
            `\n- Parameter 1: \`@john\`` +
            `\n- \`test\`: \`test\`` +
            `\n- \`meow\`: \`true\`.` +
            `\n\nSome explicit parameters can be used on every single command issued, here are the list:\n` +
            `\n- \`?delete\`: Deletes the command message after it has been executed`,
        },
      ]),
  ],
};

export default message;
