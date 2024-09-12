import { HypnoCommand } from "../../types/util";
import config from "../../config";

const command: HypnoCommand = {
    name: "unverified",
    description: "sends a list of unverified members",
    type: "admin",
    guards: ["admin"],

    handler: async (message) => {
        const members = await message.guild.members.fetch();

        const list = members.filter(x => {
            return !x.user.bot && !x.roles.cache.has(config.botServer.roles.verified)
        });

        return message.reply(`Unverified people: ${list.map(x => `${x.user.username} (${x.user.id})`).join(", ")}`)
    }
};

export default command;