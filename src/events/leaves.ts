import { client } from "..";
import config from "../config";
import { addToMemberCount } from "../util/analytics";
import { actions } from "../util/database";
import { replaceVarString } from "../util/language";
import { autoBanned } from "./guildMemberAdd";

client.on("guildMemberRemove", async (member) => {
  if (member.guild.id !== config.botServer.id) return;
  let serverSettings = await actions.serverSettings.getFor(member.guild.id);

  // Add to analytics
  await addToMemberCount(member.guild.id, member.guild.memberCount);

  // Guards

  // Check for leave message in other servers
  if (member.guild.id !== config.botServer.id) {
    if (serverSettings.leave_channel_id) {
      try {
        const channel = await client.channels.fetch(
          serverSettings.leave_channel_id
        );
        if (channel.isTextBased()) {
          await channel.send(
            replaceVarString(
              serverSettings.leave_message,
              member.user,
              member.guild
            )
          );
        }
      } catch (e) {
        console.log(`Failed to send leave message in ${member.guild.id}`, e);
      }
    }
    return;
  }

  const channel = await client.channels.fetch(
    config.botServer.channels.welcomes
  );
  if (channel.isTextBased()) {
    await channel.send(
      `**${member.user.username}** left our server :( We now have ${member.guild.memberCount} members`
    );
  }
});

client.on("guildBanAdd", async (member) => {
  if (member.guild.id !== config.botServer.id) return;

  // Add to analytics
  await addToMemberCount(member.guild.id, member.guild.memberCount);

  // Guards
  if (member.guild.id !== config.botServer.id) return;

  const channel = await client.channels.fetch(
    config.botServer.channels.welcomes
  );
  if (channel.isTextBased()) {
    await channel.send(
      `**${
        member.user.username
      }** was caught <:uppies:1278754282413490259> and **BANNED** from our server.${
        autoBanned.includes(member.user.id)
          ? "\nCourtesy of Trancer autoban :3c"
          : ""
      }`
    );
  }
});
