import { client } from "..";
import config from "../config";
import { addMoneyFor } from "../util/actions/economy";
import getInviteDetails from "../util/getInviteDetails";
import { createEmbed } from "../util/other";

client.on("guildMemberAdd", async member => {
    if (client.user.id === config.devBot) return;

    // Add default role & send message
    const channel = await client.channels.fetch(config.botServer.channels.welcomes);
    await member.roles.add(config.botServer.roles.member);
    if (channel.isTextBased()) {
        await channel.send({
            content: `<@${member.user.id}>`,
            embeds: [
                createEmbed()
                    .setTitle(`New member! :cyclone:`)
                    .setDescription(
                        `Welcome **${member.user.username}** to our server!`
                        + `\n\nMake sure to create an intro in <#1257424277855010826> and read the rules in <#1257417222620577825>!`
                        + `\n\nWe hope you enjoy your stay! :cyclone:`)
                    .setFooter({
                        text: `We now have ${member.guild.memberCount} members`
                    })
            ]
        });
    }

    // Check if the invter can be fetched
    setTimeout(async () => {
        let inviteDetails = await getInviteDetails(member.client, member.guild.id, member.id);

        // Check if suceeded
        if (inviteDetails.inviterId) {
            // Guards
            let user = await client.users.fetch(inviteDetails.inviterId);
            if (user.bot) return;

            // Add money
            await addMoneyFor(user.id, config.economy.inviting.min);
        }
    }, 30000);
});