import { HypnoCommand } from "../../types/util";
import { AttachmentBuilder } from "discord.js";
import { generateGraph } from "../../util/graphs";

const command: HypnoCommand<{ useMessagesSent?: boolean, nocap?: boolean, }> = {
    name: "balanceovertimetop10",
    aliases: ["balovertop10", "bott"],
    type: "analytics",
    description: `Get a graph of the balance of the top 15 users overtime`,

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "useMessagesSent",
                type: "boolean",
                description: "Base the top 15 off of messages instead of economy"
            },
            {
                name: "nocap",
                type: "boolean",
                description: "Remove the 500 transaction cap",
            }
        ]
    },

    handler: async (message, { args }) => {
        // Create image & attachment
        const image = await generateGraph({
            type: "line",
            guildId: message.guild.id,
            sourceTable: "money_transactions",
            sourceTableKey: "balance",
            ...(
                args.useMessagesSent
                    ? {
                        sortByTable: "user_data",
                        sortByTableKey: "messages_sent"
                    } : {
                        sortByTable: "economy",
                        sortByTableKey: "balance"
                    }
            ),
            amount: 15,
            cap: !args.nocap ? 500 : null,
        });

        const attachment = new AttachmentBuilder(image)
            .setFile(image);

        // Done
        return message.reply({
            content: `Showing top 15 users in **${args.useMessagesSent ? "messages" : "economy"}** leaderboard`,
            files: [attachment]
        });
    }
};

export default command;