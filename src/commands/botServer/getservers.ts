import { HypnoCommand } from "../../types/command";

const command: HypnoCommand = {
    name: "getservers",
    botServerOnly: true,
    adminOnly: true,
    type: "admin",

    handler: async (message) => {
        const guilds = await message.client.guilds.fetch();
        return message.reply(`List of servers I'm in: ${guilds.map(x => x.name).join(", ")}`);
    }
}

export default command;