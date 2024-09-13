import { Invite, TextChannel } from "discord.js";
import { client } from "..";
import config from "../config";
import { addMoneyFor } from "../util/actions/economy";
import { getServerSettings } from "../util/actions/settings";
import { addToMemberCount } from "../util/analytics";
import getInviteDetails from "../util/getInviteDetails";
import { createEmbed } from "../util/other";

let inviteCache: { [key: string]: { [key: string]: number } } = {};
export async function initInviteCache() {
    let guilds = await client.guilds.fetch();
    for (const [_, _guild] of guilds) {
        if (!inviteCache[_guild.id]) inviteCache[_guild.id] = {};

        try {
            let guild = await client.guilds.fetch(_guild.id);
            let invites = await guild.invites.fetch();
            for (const [_, invite] of invites) {
                inviteCache[_guild.id][invite.code] = invite.uses;
            }
        } catch { }
    }
}

client.on("guildMemberAdd", async member => {
    // Add to analytics
    await addToMemberCount(member.guild.id, member.guild.memberCount);

    // Guards
    if (client.user.id === config.devBot) return;

    // Check invite logger
    let serverSettings = await getServerSettings(member.guild.id);

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
            let channel = await member.guild.channels.fetch(serverSettings.invite_logger_channel_id) as TextChannel;
            await channel.send({
                embeds: [
                    createEmbed()
                        .setTitle(`${member.user.username} invite details`)
                        .setDescription(
                            `**Invited By**: ${usedCode.inviter.username} (<@${usedCode.inviter.id}>)`
                            + `\n**Invite Code**: ${usedCode.code} (${usedCode.uses} uses)`
                        )
                ]
            });
        }
    }

    // Check for welcome messages only in bot server
    if (member.guild.id !== config.botServer.id) return;

    // Add default role & send message
    const channel = await client.channels.fetch(config.botServer.channels.welcomes);
    if (channel.isTextBased()) {
        await channel.send({
            content: `<@${member.user.id}>`,
            embeds: [
                createEmbed()
                    .setTitle(`New member! :cyclone:`)
                    .setDescription(
                        `Welcome **${member.user.username}** to our server!`
                        + `\n\nMake sure to read the rules in <#1257417222620577825>!`
                        + `\nThen get your roles in <#1281288438074835036>`
                        + `\nThen create an intro in <#1257424277855010826>to get access to the server!`
                        + `\n\nWe hope you enjoy your stay! :cyclone:`)
                    .setFooter({
                        text: `We now have ${member.guild.memberCount} members`
                    })
            ]
        });
    }

    // Check if the invter can be fetched
    let attempts = 0;
    function attempt() {
        // Wait 30 seconds before trying
        setTimeout(async () => {
            try {
                let inviteDetails = await getInviteDetails(member.client, member.guild.id, member.id);

                // Check if suceeded
                if (inviteDetails.inviterId) {
                    // Guards
                    let user = await client.users.fetch(inviteDetails.inviterId);
                    if (user.bot) return;

                    // Add money
                    await addMoneyFor(user.id, config.economy.inviting.min, "helping");
                    await user.send(`Thanks for inviting ** ${member.user.username} ** to our server!\nYou earnt ** ${config.economy.inviting.min}${config.economy.currency} ** `);
                }
            } catch (err) {
                console.log(err);

                // Allow only 3 attempts
                attempts++;
                if (attempts > 3) return;
                attempt();
            }
        }, 30000);
    }; attempt();
});