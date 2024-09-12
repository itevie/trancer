import { client } from "..";
import config from "../config";
import { addToMemberCount } from "../util/analytics";

client.on("guildMemberRemove", async member => {
    if (member.guild.id !== config.botServer.id) return;

    // Add to analytics
    await addToMemberCount(member.guild.id, member.guild.memberCount);

    // Guards
    if (member.guild.id !== config.botServer.id) return;

    const channel = await client.channels.fetch(config.botServer.channels.welcomes);
    if (channel.isTextBased()) {
        await channel.send(`**${member.user.username}** left our server :( We now have ${member.guild.memberCount} members`);
    }
});

client.on("guildBanAdd", async member => {
    if (member.guild.id !== config.botServer.id) return;

    // Add to analytics
    await addToMemberCount(member.guild.id, member.guild.memberCount);

    // Guards
    if (member.guild.id !== config.botServer.id) return;

    const channel = await client.channels.fetch(config.botServer.channels.welcomes);
    if (channel.isTextBased()) {
        await channel.send(`**${member.user.username}** was caught <:uppies:1278754282413490259> and **BANNED** from our server.`);
    }
});