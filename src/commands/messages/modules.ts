import { handlers } from "../..";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
    name: "modules",
    description: "List the active message handlers",
    type: "messages",

    handler: (message) => {
        return message.reply(`The following message handlers are enabled:\n${handlers.map(x => `\`${x.name}\``).join(", ")}`);
    }
}

export default command;