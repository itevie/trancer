import { HypnoCommand } from "../../types/util";
import { getServerCount } from "../../util/actions/serverCount";
import { database } from "../../util/database";

const command: HypnoCommand = {
    name: "setupcount",
    type: "counting",
    description: "Setup the counting in the current channel",
    adminOnly: true,

    handler: async (message) => {
        if (await getServerCount(message.guild.id)) {
            await database.run(`UPDATE server_count SET channel_id = ? WHERE server_id = ?`, message.channel.id, message.guild.id);
            return message.reply(`The server's count has been updated to this channel!`);
        } else {
            await database.run(`INSERT INTO server_count (server_id, channel_id) VALUES (?, ?)`, message.guild.id, message.channel.id);
            return message.reply(`Sucessfully set up counting for this channel!`);
        }
    }
};

export default command;