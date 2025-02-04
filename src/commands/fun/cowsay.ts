import { spawn } from "child_process";
import { HypnoCommand } from "../../types/util";

export const varients =
  `actually alpaca beavis.zen blowfish bong bud-frogs bunny cheese cower
cupcake daemon default dragon dragon-and-cow elephant elephant-in-snake
eyes flaming-sheep fox ghostbusters head-in hellokitty kiss kitty koala
kosh llama luke-koala mech-and-cow meow milk moofasa moose mutilated ren
sheep skeleton small stegosaurus stimpy supermilker surgery sus three-eyes
turkey turtle tux udder vader vader-koala www`
    .replace(/\n/g, " ")
    .split(" ");

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
        oneOf: [...varients],
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
