import { HypnoCommand } from "../../types/util";

const messages: string[] = [
  "*up up up!* All the way up!",
  "Wake up!! *up up up!* all the way up!",
  "*up up up* nice and aware! Nice and awake!",
  "*pat and up up up!*",
];

const command: HypnoCommand = {
  name: "uppies",
  description: "Ups you!",
  type: "imposition",
  aliases: ["up", "ups"],

  handler: async (message) => {
    return message.reply(messages[Math.floor(Math.random() * messages.length)]);
  },
};

export default command;
