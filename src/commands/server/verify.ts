import { PermissionsBitField, TextChannel } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { addRole } from "../../util/other";
import { replaceVarString } from "../../util/language";

const command: HypnoCommand = {
  name: "verify",
  description: "Verifies a member",
  aliases: ["v"],
  type: "admin",
  permissions: [PermissionsBitField.Flags.ManageMessages],
  except: (m) => {
    // Allow mini helper which has no perms
    return m.member.roles.cache.has("1366865032151040121");
  },

  handler: async (message, o) => {
    let verifiedRole = o.serverSettings.verification_role_id;
    let unverifiedRole = o.serverSettings.unverified_role_id;

    if (!verifiedRole && !unverifiedRole)
      return message.reply(`There is no verified/unverified role set up`);

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
      if (verifiedRole)
        await addRole(member, await message.guild.roles.fetch(verifiedRole));
      if (unverifiedRole) await member.roles.remove(unverifiedRole);
      await message.delete();

      try {
        await msg.react("✅");
      } catch {}

      if (
        o.serverSettings.verified_channel_id &&
        o.serverSettings.verified_string
      ) {
        let channel = await (message.client.channels.fetch(
          o.serverSettings.verified_channel_id,
        ) as Promise<TextChannel>);
        await channel.send(
          replaceVarString(
            o.serverSettings.verified_string,
            member.user,
            member.guild,
          ),
        );
      }
    } catch (e) {
      return message.reply(`Error: ${e.toString()}`);
    }
  },
};

export default command;
