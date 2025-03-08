import { PermissionsBitField, TextChannel } from "discord.js";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
  name: "verify",
  description: "Verifies a member",
  aliases: ["v"],
  type: "admin",
  permissions: [PermissionsBitField.Flags.ManageMessages],

  handler: async (message, o) => {
    let role = o.serverSettings.verification_role_id;

    if (!role) return message.reply(`There is no verified role set up`);

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
      const msg = await message.fetchReference();
      const member = await message.guild.members.fetch(msg.member);
      await member.roles.add(role);
      await message.delete();

      if (
        o.serverSettings.verified_channel_id &&
        o.serverSettings.verified_string
      ) {
        let user = (await message.fetchReference()).member.user;
        (
          await (message.client.channels.fetch(
            o.serverSettings.verified_channel_id
          ) as Promise<TextChannel>)
        ).send(
          o.serverSettings.verified_string
            .replace(/\{mention\}/g, `<@${user.id}>`)
            .replace(/\{username\}/g, user.username)
        );
      }
    } catch (e) {
      console.log(e);
      return message.reply(`Error: ${e.toString()}`);
    }
  },
};

export default command;
