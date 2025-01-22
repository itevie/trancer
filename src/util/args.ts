import { HypnoCommand } from "../types/util";

export function generateCommandCodeBlock(
  commandName: string,
  command: HypnoCommand,
  serverSettings: ServerSettings,
  name?: string
) {
  let commandPart = `${serverSettings.prefix}${commandName}`;
  let codeblock = ``;

  for (let i in command.args.args) {
    let isRequired = command.args.requiredArguments > +i;
    codeblock += ` ${isRequired ? "<" : "["}${
      command.args.args[i].wickStyle ? "?" : ""
    }${command.args.args[i].name}${isRequired ? ">" : "]"}`;
  }

  if (name) {
    let index = codeblock.indexOf(name);
    codeblock += `\n${" ".repeat(index + commandPart.length)}${"^".repeat(
      name.length
    )}`;
  }

  codeblock = "```" + commandPart + codeblock + "```";

  return codeblock;
}
