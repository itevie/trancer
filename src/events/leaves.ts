import { client } from "..";
import config from "../config.json";

client.on("guildMemberRemove", async member => {
    const channel = await client.channels.fetch(config.botServer.channels.welcomes);
    if (channel.isTextBased()) {
        await channel.send(`**${member.user.username}** left our server :( We now have ${member.guild.memberCount} members`);
    }
});

client.on("guildBanAdd", async member => {
    const channel = await client.channels.fetch(config.botServer.channels.welcomes);
    if (channel.isTextBased()) {
        await channel.send(`**${member.user.username}** Was **BANNED** from our server.`);
    }
});