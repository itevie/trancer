import { PermissionsBitField, TextChannel } from "discord.js";
import { HypnoCommand } from "../../types/util";
import config from "../../config";

const command: HypnoCommand = {
  name: "verify",
  description: "Verifies a member",
  aliases: ["v"],
  type: "admin",
  permissions: [PermissionsBitField.Flags.ManageMessages],

  handler: async (message) => {
    if (!config.botServer.roles.verified)
      return message.reply(`There is no verified role set up`);

    // Check for reference
    if (!message.reference) {
      let msg = await message.reply(`Please reply to a message.`);
      setTimeout(async () => {
        await msg.delete();
        await message.delete();
      }, 5000);
      return;
    }

    // Add role
    try {
      await (
        await message.fetchReference()
      ).member.roles.add(config.botServer.roles.verified);
      await message.delete();
      (
        await (message.client.channels.fetch(
          "1257416274280054967"
        ) as Promise<TextChannel>)
      ).send(
        `<@${
          (await message.fetchReference()).member.user.id
        }> just got verified! Welcome!`
      );
    } catch (e) {
      console.log(e);
      return message.reply(`Error: ${e.toString()}`);
    }
  },
};

export default command;
