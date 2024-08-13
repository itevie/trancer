import { HypnoCommand } from "../../types/command";
import config from "../../config";
import { getEconomyFor, addMoneyFor, setLastDaily } from "../../util/actions/economy";
import { createEmbed, randomFromRange } from "../../util/other";

const command: HypnoCommand = {
    name: "daily",
    description: `Get your daily reward of ${config.economy.currency}!`,
    type: "economy",

    handler: async (message) => {
        // Computer timings
        let economy = await getEconomyFor(message.author.id);
        let last = +new Date(economy.last_daily);
        let time = 8.64e+7 - (Date.now() - last);

        // Check if they can fish
        if (time < 0) {
            // Give money
            let money = randomFromRange(config.economy.daily.min, config.economy.daily.max);

            await addMoneyFor(message.author.id, money);
            await setLastDaily(message.author.id);

            // Reply
            return message.reply({
                embeds: [
                    createEmbed()
                        .setTitle(`You collected your daily box of ${config.economy.currency}`)
                        .setDescription(`You earnt **${money}**${config.economy.currency}!`)
                ]
            });
        }

        // They cannot fish
        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`You have already collected your daily!`)
                    .setDescription(`Come back in ${(time / 60000).toFixed(0)} minutes!`)
                    .setColor("#FF0000")
            ]
        });
    }
}

export default command;