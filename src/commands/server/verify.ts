import { GuildMember, PermissionsBitField, TextChannel } from "discord.js";
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

      let member: GuildMember;
      try {
        member = await message.guild.members.fetch(msg.member);
      } catch (e) {
        return message.reply(
          `I don't think that member is in the server anymore.`,
        );
      }

      try {
        if (verifiedRole)
          await addRole(member, await message.guild.roles.fetch(verifiedRole));
      } catch (e) {
        return {
          content: "Failed to give the verified role!\n> " + e.toString(),
        };
      }

      try {
        if (unverifiedRole) await member.roles.remove(unverifiedRole);
      } catch (e) {
        return {
          content: `Failed to remove unverified role!\n> ${e.toString()}`,
        };
      }

      try {
        await message.delete();
        await msg.react("✅");
      } catch {}

      if (
        o.serverSettings.verified_channel_id &&
        o.serverSettings.verified_string
      ) {
        let channel: TextChannel;
        try {
          let channel = await (message.client.channels.fetch(
            o.serverSettings.verified_channel_id,
          ) as Promise<TextChannel>);
        } catch (e) {
          return {
            content: `Failed to fetch the channel to send the message in!\n> ${e.toString()}`,
          };
        }

        try {
          await channel.send(
            replaceVarString(
              o.serverSettings.verified_string,
              member.user,
              member.guild,
            ),
          );
        } catch (e) {
          return {
            content:
              "Failed to send the message in the channel!\n> " + e.toString(),
          };
        }
      }
    } catch (e) {
      return message.reply(`Error: ${e.toString()}`);
    }
  },
};

export default command;
