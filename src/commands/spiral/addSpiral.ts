import { HypnoCommand } from "../../types/command";
import { addSpiral, hasSpiral } from "../../util/actions/spirals";
import { getServerSettings } from "../../util/actions/settings";
import config from "../../config.json";

const command: HypnoCommand = {
    name: "addspiral",
    aliases: ["as"],
    description: "Adds a spiral (link to one) to the database",
    usage: [
        ["addspiral <link>", "Add a link which is after the spiral command"]
    ],
    type: "spirals",
    adminOnly: true,
    botServerOnly: true,
    allowExceptions: true,

    handler: async (message, { oldArgs: args }) => {
        // Get spiral to add
        let content: string = "";
        if (message.reference) {
            content = (await message.fetchReference()).content;
        } else if (args[0]) {
            content = args[0];
        } else {
            return message.reply(
                `Please reply to a message which contains the spiral, or use \`${(await getServerSettings(message.guild.id)).prefix}spiral <link>\` :cyclone:`
            );
        }
        content = content
            .replace(/^(<)/, "")
            .replace(/(>)$/, "");

        // Validate
        if (!content.match(/^(https:\/\/[^ ]{20,})/))
            return message.reply(`Please provide an image`);

        // Add it
        if (await hasSpiral(content))
            return message.reply(`That spiral already exists in the database!`);
        await addSpiral(content, message.author.id);

        console.log(`Added spiral: ${content}`);

        // Done
        const channel = (await message.client.channels.fetch(config.botServer.channels.logs));
        if (channel.isTextBased()) {
            await channel.send(`The following spiral was added by ${message.author.username}`);
            await channel.send(content);
        }

        return await message.reply(`Added, thank you :cyclone:`);
    }
}

export default command;