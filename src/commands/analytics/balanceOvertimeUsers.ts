import { HypnoCommand } from "../../types/command";
import { AttachmentBuilder } from "discord.js";
import { generateGraph } from "../../util/graphs";

const command: HypnoCommand = {
    name: "balanceovertimeusers",
    aliases: ["baloverusers", "bou"],
    type: "analytics",
    description: `Get a graph of the balance of certain people overtime`,

    handler: async (message, { oldArgs }) => {
        let cap = oldArgs[0] !== "nocap" ? (oldArgs.shift() && 500) : null;

        if (oldArgs.length > 20 || oldArgs.length < 2)
            return message.reply(`Please provide 2-20 users!`);

        // Create image & attachment
        const image = await generateGraph({
            type: "line",
            guildId: message.guild.id,
            sourceTable: "money_transactions",
            sourceTableKey: "balance",
            sortByTable: "user_data",
            sortByTableKey: "messages_sent",
            users: oldArgs.map(x => x.replace(/[<>@]/g, "")),
            cap,
        });

        const attachment = new AttachmentBuilder(image)
            .setFile(image);

        // Done
        return message.reply({
            files: [attachment]
        });
    }
};

export default command;