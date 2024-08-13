import { HypnoCommand } from "../../types/command";
import config from "../../config";
import { getEconomyFor, addMoneyFor, setLastFish } from "../../util/actions/economy";
import { createEmbed, randomFromRange } from "../../util/other";

const command: HypnoCommand = {
    name: "fish",
    description: `Fish for fishes in the open sea and earn ${config.economy.currency}!`,
    type: "economy",

    handler: async (message) => {
        // Computer timings
        let economy = await getEconomyFor(message.author.id);
        let last = +new Date(economy.last_fish);
        let time = config.economy.fish.limit - (Date.now() - last);

        // Check if they can fish
        if (time < 0) {
            // Give money
            let money = randomFromRange(config.economy.fish.min, config.economy.fish.max);

            await addMoneyFor(message.author.id, money);
            await setLastFish(message.author.id);

            let fish: string[] = [];
            for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
                let keys = Array.from(message.guild.members.cache.keys());
                let name = message.guild.members.cache.get(keys[Math.floor(Math.random() * keys.length)]).user.username;
                if (!fish.includes(name))
                    fish.push(`**${name}**`);
            }

            // Reply
            return message.reply({
                embeds: [
                    createEmbed()
                        .setTitle(`You went fishing! 🎣`)
                        .setDescription(`You caught ${fish.join(", ")} and earnt **${money}**${config.economy.currency}!`)
                ]
            });
        }

        // They cannot fish
        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`You have already fished :(`)
                    .setDescription(`Come back in ${(time / 60000).toFixed(0)} minutes!`)
                    .setColor("#FF0000")
            ]
        });
    }
}

export default command;