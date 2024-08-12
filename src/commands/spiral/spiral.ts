import { HypnoCommand } from "../../types/command";
import { getRandomSpiral, getSpirals } from "../../util/actions/spirals";

export const sentSpirals: { [key: string]: Spiral } = {};

const command: HypnoCommand = {
    name: "spiral",
    type: "spirals",
    aliases: ["s"],
    description: "Sends a random spiral :cyclone:",
    usage: [
        ["spiral list", "List the amount of spirals registered"],
    ],

    handler: async (message, { oldArgs: args }) => {
        if (args[0] === "list") {
            return message.reply(`There are ${(await getSpirals()).length} spirals registered`);
        }

        let spiral = await getRandomSpiral();

        let msg = await message.channel.send(
            spiral.link
                .replace(/^(<)/, "")
                .replace(/(>)$/, "")
        );

        sentSpirals[msg.id] = spiral;

        return;
    }
}

export default command;