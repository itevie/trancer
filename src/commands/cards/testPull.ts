import config from "../../config";
import { HypnoCommand } from "../../types/command";

const command: HypnoCommand = {
    name: "testpull",
    type: "cards",
    description: "Examples of the chances of a pull",

    handler: async (message, args) => {
        let getOne = () => {
            // Get the rarity
            let rarity: Rarity;
            for (const i in config.cards.weights) {
                // Check if random is LESS than the rarity
                // Because 0.34234 < 0.05 = false
                if (Math.random() < config.cards.weights[i]) {
                    rarity = i as Rarity;
                    break;
                }
            }

            // Obviously, there might be no matches, so just pick one of these
            if (!rarity) rarity = Math.random() < 0.6 ? "common" : "uncommon";

            return rarity;
        }

        let amount = (num: number) => {
            let results = {};
            for (let i = 0; i != num; i++) {
                let res = getOne();
                if (!results[res]) results[res] = 0;
                results[res]++;
            }
            return results;
        }

        return message.reply(
            `One: ${getOne()}\n10: ${JSON.stringify(amount(10))}\n100: ${JSON.stringify(amount(100))}`
            + `\n1000: ${JSON.stringify(amount(1000))}\n10000: ${JSON.stringify(amount(10000))}`
        );
    }
}

export default command;