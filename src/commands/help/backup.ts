import * as fs from "fs";
import { HypnoCommand } from "../../types/util";
import * as path from "path";
import { createBackup } from "../../util/other";

const command: HypnoCommand = {
    name: "backup",
    botOwnerOnly: true,

    handler: (message) => {
        createBackup();
        return message.reply(`Created backup!`);
    }
};

export default command;