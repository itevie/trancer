//import { HypnoCommand } from "../../types/command";
//import config from "../../config";

const command: HypnoCommand = {
    name: "unverified",
    aliases: ["uv"],
    description: `Get list of unverified users`,
    usage: [
        ["$cmd ping", "Ping unverified users"],
    ],
    botServerOnly: true,
    adminOnly: true,

    handler: async (message, args) => {
        const members = await message.guild.members.fetch();

        const list = members.filter(x => {
            return !x.user.bot && !x.roles.cache.has(config.roles.verified)
        });

        if (args[0] === "ping") {
            await message.delete();
            return message.channel.send(`${list.map(x => `<@${x.user.id}>`).join(", ")} please create an intro in <#1250249740281712722> to get verified into the server!`);
        }

        return message.reply(`Unverified Users:\n${list.map(x => `\`${x.user.username}\``).join(", ")}`);
    }
}

export default command;