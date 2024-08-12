import { HypnoCommand } from "../../types/command";
import { getServerCount } from "../../util/actions/serverCount";

const command: HypnoCommand = {
    name: "currentcount",
    type: "counting",
    description: "Get the expected next number in the count",

    handler: async (message) => {
        let count = await getServerCount(message.guild.id);
        if (!count) {
            return message.reply(`This server does not have counting enabled... but what if it did?`);
        }

        return message.reply(`The **next** expected number is **${count.current_count + 1}**`);
    }
};

export default command;