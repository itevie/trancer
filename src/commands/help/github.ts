import { promisify } from "util";
import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { exec } from "child_process";

const command: HypnoCommand = {
    name: "github",
    type: "help",
    description: "Get the GitHub link for this bot",

    handler: async (message) => {
        let { stdout } = await promisify(exec)(("git log -1 --pretty=%B"));

        return message.reply(`${config.credits.github}\n\n**Latest Commit:** ${stdout.trim()}`);
    }
};

export default command;