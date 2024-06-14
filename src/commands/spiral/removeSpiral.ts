import { HypnoCommand } from "../../types/command";
import { deleteSpiral, hasSpiral } from "../../util/actions/spirals";
import { getServerSettings } from "../../util/actions/settings";

const command: HypnoCommand = {
    name: "removespiral",
    type: "spirals",
    adminOnly: true,
    hideoutOnly: true,
    allowExceptions: true,

    handler: async (message, args) => {
        // Get spiral to add
        let content: string = "";
        if (message.reference) {
            content = (await message.fetchReference()).content;
        } else if (args[0]) {
            content = args[0];
        } else {
            return message.reply(
                `Please reply to a message which contains the spiral, or use \`${(await getServerSettings(message.guild.id)).prefix}removespiral <link>\` :cyclone:`
            );
        }

        content = content
            .replace(/^(<)/, "")
            .replace(/(>)$/, "");

        if (!await hasSpiral(content))
            return message.reply(`That spiral does not exist in the database!`);

        await deleteSpiral(content);
        return await message.reply(`Removed :cyclone:`);
    }
}

export default command;