import { client } from "..";
import config from "../config.json";
import { createEmbed } from "../util/other";

client.on("guildMemberAdd", async member => {
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
});