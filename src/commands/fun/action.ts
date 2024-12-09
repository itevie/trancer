import { HypnoCommand } from "../../types/util";
import axios from "axios";
import { User } from "discord.js";

const types = [
  "airkiss",
  "angrystare",
  "bite",
  "bleh",
  "blush",
  "brofist",
  "celebrate",
  "cheers",
  "clap",
  "confused",
  "cool",
  "cry",
  "cuddle",
  "dance",
  "drool",
  "evillaugh",
  "facepalm",
  "handhold",
  "happy",
  "headbang",
  "hug",
  "huh",
  "kiss",
  "laugh",
  "lick",
  "love",
  "mad",
  "nervous",
  "no",
  "nom",
  "nosebleed",
  "nuzzle",
  "nyah",
  "pat",
  "peek",
  "pinch",
  "poke",
  "pout",
  "punch",
  "roll",
  "run",
  "sad",
  "scared",
  "shout",
  "shrug",
  "shy",
  "sigh",
  "sip",
  "slap",
  "sleep",
  "slowclap",
  "smack",
  "smile",
  "smug",
  "sneeze",
  "sorry",
  "stare",
  "stop",
  "surprised",
  "sweat",
  "thumbsup",
  "tickle",
  "tired",
  "wave",
  "wink",
  "woah",
  "yawn",
  "yay",
  "yes",
];

const command: HypnoCommand<{ user?: User }> = {
  name: "action",
  type: "actions",
  eachAliasIsItsOwnCommand: true,
  aliases: types,
  description: "Actions on others!",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        type: "user",
      },
    ],
  },

  handler: async (message, options) => {
    if (options.command === "action") {
      return message.reply(
        `Cool! You wanna use an action! The current actions are: ${command.aliases
          .map((x) => `**${x}**`)
          .join(", ")}`
      );
    }

    if (
      options.args?.user?.id === message.author.id &&
      ["bite", "kill", "punch"].includes(options.command)
    ) {
      return message.reply(`Hey! Don't do that to yourself :(\nWe love you!`);
    }

    const result = await axios.get(
      `https://api.otakugifs.xyz/gif?reaction=${options.command}`
    );
    return message.reply(result.data.url);
  },
};

export default command;
