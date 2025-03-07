import { Invite, TextChannel } from "discord.js";
import { client } from "..";
import config from "../config";
import { addMoneyFor } from "../util/actions/economy";
import { addToMemberCount } from "../util/analytics";
import getInviteDetails from "../util/getInviteDetails";
import { createEmbed } from "../util/other";
import { actions, database } from "../util/database";
import ecoConfig from "../ecoConfig";
import { currency } from "../util/textProducer";

let inviteCache: { [key: string]: { [key: string]: number } } = {};
export async function initInviteCache() {
  inviteCache = {};
  let guilds = await client.guilds.fetch();
  for (const [_, _guild] of guilds) {
    if (!inviteCache[_guild.id]) inviteCache[_guild.id] = {};

    try {
      let guild = await client.guilds.fetch(_guild.id);
      let invites = await guild.invites.fetch();
      for (const [_, invite] of invites) {
        inviteCache[_guild.id][invite.code] = invite.uses;
      }
    } catch {}
  }
}

client.on("inviteCreate", async (invite) => {
  await initInviteCache();
  if (!inviteCache[invite.guild.id][invite.code])
    inviteCache[invite.guild.id][invite.code] = 0;
});

export let autoBanned: string[] = [];

export function checkAutoban(u: string, keywords: string[]): boolean {
  for (const k of keywords)
    if (u.toLowerCase().replace(/\s+/g, "").includes(k)) return true;
  return false;
}

client.on("guildMemberAdd", async (member) => {
  // Add to analytics
  await addToMemberCount(member.guild.id, member.guild.memberCount);

  // Guards
  if (client.user.id === config.devBot.id) return;

  // Check invite logger
  let serverSettings = await actions.serverSettings.getFor(member.guild.id);

  if (serverSettings.auto_ban_enabled) {
    let abk = serverSettings.auto_ban_keywords
      .split(";")
      .filter((x) => x.length > 1);
    if (
      checkAutoban(member.user.username, abk) ||
      checkAutoban(member.user.displayName, abk)
    ) {
      if (member.guild.id === config.botServer.id)
        autoBanned.push(member.user.id);

      await member.ban({
        reason: `Triggered autoban`,
      });

      await database.run(
        `UPDATE server_settings SET auto_ban_count = auto_ban_count + 1 WHERE server_id = ?`,
        member.guild.id
      );

      return;
    }
  }

  if (serverSettings.invite_logger_channel_id) {
    let usedCode: Invite | null = null;
    for await (const [_, invite] of await member.guild.invites.fetch()) {
      if (invite.uses !== inviteCache[member.guild.id][invite.code]) {
        usedCode = invite;
        inviteCache[member.guild.id][invite.code] = invite.uses;
        break;
      }
    }

    if (usedCode) {
      // Send it
      let channel = (await member.guild.channels.fetch(
        serverSettings.invite_logger_channel_id
      )) as TextChannel;
      await channel.send({
        embeds: [
          createEmbed()
            .setTitle(`${member.user.username} invite details`)
            .setDescription(
              `**Invited By**: ${usedCode.inviter.username} (<@${usedCode.inviter.id}>)` +
                `\n**Invite Code**: ${usedCode.code} (${usedCode.uses} uses)`
            ),
        ],
      });
    }
  }

  // Check for welcome messages only in bot server
  if (member.guild.id !== config.botServer.id) return;

  // Send welcome message
  (
    (await client.channels.fetch(
      config.botServer.channels.welcomes
    )) as TextChannel
  ).send({
    content: `<@${member.user.id}>`,
    embeds: [
      createEmbed()
        .setTitle(`New member! :cyclone:`)
        .setDescription(
          `Welcome **${member.user.username}** to our server!` +
            `\n\nRead here: <#1283861103964717126> to get access to our server!` +
            `\n\nWe hope you enjoy your stay! :cyclone:`
        )
        .setFooter({
          text: `We now have ${member.guild.memberCount} members`,
        }),
    ],
  });

  // Send ping in how to verify
  let tempMessage = await (
    (await client.channels.fetch(
      config.botServer.channels.howToVerify
    )) as TextChannel
  ).send(`<@${member.user.id}> read here on how to join our server!`);

  setTimeout(async () => {
    await tempMessage.delete();
  }, 1000 * 60 * 5);

  // Check if the invter can be fetched
  let attempts = 0;
  function attempt() {
    // Wait 30 seconds before trying
    setTimeout(async () => {
      try {
        let inviteDetails = await getInviteDetails(
          member.client,
          member.guild.id,
          member.id
        );

        // Check if suceeded
        if (inviteDetails?.inviterId) {
          // Guards
          let user = await client.users.fetch(inviteDetails.inviterId);
          if (user.bot) return;

          // Add money
          await addMoneyFor(user.id, ecoConfig.payouts.inviting.min, "helping");
          await user.send(
            `Thanks for inviting ** ${
              member.user.username
            } ** to our server!\nYou earnt ${currency(
              ecoConfig.payouts.inviting.min
            )}`
          );
        } else {
          // Allow only 3 attempts
          attempts++;
          if (attempts > 3) return;
          attempt();
        }
      } catch (err) {
        // Allow only 3 attempts
        attempts++;
        if (attempts > 3) return;
        attempt();
      }
    }, 30000);
  }
  attempt();
});
