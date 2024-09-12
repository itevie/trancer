import { HypnoCommand } from "../../types/util";
import { createBackup } from "../../util/other";

const command: HypnoCommand = {
    name: "backup",
    description: "Creates a database backup",
    guards: ["bot-owner"],

    handler: (message) => {
        createBackup();
        return message.reply(`Created backup!`);
    }
};

export default command;