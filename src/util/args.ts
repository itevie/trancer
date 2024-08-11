import { HypnoCommand } from "../types/command";

export function generateCommandCodeBlock(command: HypnoCommand, serverSettings: ServerSettings) {
    let codeblock = "```" + `${serverSettings.prefix}${command.name}`;

    for (let i in command.args.args) {
        let isRequired = command.args.requiredArguments > +i;
        codeblock += ` ${isRequired ? '<' : '['}${command.args.args[i].name}${isRequired ? '>' : ']'}`;
    }

    codeblock += "```";

    return codeblock;
}