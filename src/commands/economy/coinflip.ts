import { ActionRowBuilder, ButtonBuilder, ButtonStyle, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { addMoneyFor, getEconomyFor, removeMoneyFor } from "../../util/actions/economy";
import config from "../../config";
import { createEmbed } from "../../util/other";

export const existingGames: { [key: string]: string } = {};

const command: HypnoCommand<{ user: User, amount: number }> = {
    name: "coinflip",
    aliases: ["cf"],
    description: "Coinflip with another user",
    type: "economy",

    args: {
        requiredArguments: 2,
        args: [
            {
                name: "user",
                type: "user"
            },
            {
                name: "amount",
                type: "wholepositivenumber"
            }
        ]
    },

    handler: async (message, { args, serverSettings }) => {
        let amount = args.amount;

        if (message.author.id === args.user.id)
            return message.reply(`You cannot coinflip yourself!`);

        // Get the users ecos
        let requesterEco = await getEconomyFor(message.author.id);
        let requesteeEco = await getEconomyFor(args.user.id);

        // Check if both users have enough
        if (requesterEco.balance < amount)
            return message.reply(`You do not have enough to coinflip **${amount}${config.economy.currency}**!`);
        if (requesteeEco.balance < amount)
            return message.reply(`The other person does not have enough to coinflip **${amount}${config.economy.currency}**!`);

        if (existingGames[message.author.id])
            return message.reply(`You have already requested a coinflip!\nIf you cannot find the cancel button, run \`${serverSettings.prefix}cancelcf\``);
        existingGames[message.author.id] = args.user.id;

        // Send duel message
        let msg = await message.reply({
            content: `<@${args.user.id}>`,
            embeds: [
                createEmbed()
                    .setTitle(`${args.user.username}, ${message.author.username} has requested a coinflip!`)
                    .setDescription(`The coinflip is worth **${args.amount}${config.economy.currency}**!\n\n` +
                        `Press the green button to accept this coinflip.\nClick the red button to cancel this`)
            ],
            components: [
                // @ts-ignore
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Accept")
                            .setStyle(ButtonStyle.Success)
                            .setCustomId("accept"),

                        new ButtonBuilder()
                            .setLabel("Cancel")
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId("cancel")
                    )
            ]
        });

        let collector = msg.createMessageComponentCollector()
        collector.on("collect", async data => {
            // Check if it was cancelled
            if (!existingGames[message.author.id]) {
                collector.stop();
                return message.reply(`This coinflip was cancelled!`);
            }

            // Check if cancel
            if (data.customId === "cancel") {
                // Check if author
                if (data.user.id !== message.author.id && data.user.id !== args.user.id)
                    return data.reply({
                        content: `You are not the author of this coinflip!`,
                        ephemeral: true,
                    });
                await msg.edit({
                    embeds: [],
                    components: [],
                    content: `The coinflip between **${message.author.username}** and **${args.user.username}** was cancelled! `
                });
                collector.stop();
                delete existingGames[message.author.id];
            } else if (data.customId === "accept") {
                // Check if right person
                if (data.user.id !== args.user.id)
                    return data.reply({
                        content: "You are cannot accept a coinflip which isn't for you",
                        ephemeral: true
                    });
                collector.stop();
                delete existingGames[message.author.id];

                let win = Math.random() < 0.5;

                // Send init message
                let m = await message.channel.send(`Flipping the coin between **${message.author.username}** and **${args.user.username}**...`);

                // Check if the person goes into negatives
                let winner = win ? message.author : args.user;
                let loser = message.author.id === winner.id ? args.user : message.author;

                // Check if the loser would go into debt
                if (((await getEconomyFor(loser.id)).balance) < args.amount)
                    return await m.edit(`Could not complete the coinflip, as the loser no longer has **${args.amount}${config.economy.currency}**`);

                setTimeout(async () => {
                    await m.edit(`**${winner.username}** won the coinflip for **${args.amount}${config.economy.currency}**!`);
                    await addMoneyFor(winner.id, args.amount, "gambling");
                    await removeMoneyFor(loser.id, args.amount, true);
                }, 1000);
            }
        });
    }
};
export default command;