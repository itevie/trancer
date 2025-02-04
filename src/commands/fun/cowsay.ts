import { spawn } from "child_process";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand<{ content: string; cow: string }> = {
  name: "cowsay",
  type: "fun",
  description: "Say text as a cow",
  args: {
    requiredArguments: 1,
    args: [
      {
        name: "content",
        type: "string",
        description: 'Set this as "list" to view the available cows',
        takeContent: true,
        infer: true,
      },
      {
        name: "cow",
        aliases: ["f", "c"],
        type: "string",
        wickStyle: true,
      },
    ],
  },

  handler: (message, { args }) => {
    const child = spawn(
      "cowsay",
      args.content.toLowerCase() === "list"
        ? ["-l"]
        : args.cow
        ? ["-f", args.cow, args.content]
        : [args.content]
    );

    child.stdout.on("data", (data) => {
      return message.reply("```" + data + "```");
    });

    child.stderr.on("data", (data) => {
      return message.reply((data as Buffer).toString());
    });
  },
};

export default command;
