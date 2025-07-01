import { HypnoCommand } from "../../types/util";
import axios from "axios";
import { embedLength, SlashCommandBuilder, User } from "discord.js";
import { createEmbed } from "../../util/other";

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
] as const;

const commonTypes = [
  "hug",
  "pat",
  "kiss",
  "slap",
  "poke",
  "wave",
  "smile",
  "blush",
  "cry",
  "laugh",
  "stare",
  "angrystare",
  "facepalm",
  "thumbsup",
  "clap",
  "cheers",
  "dance",
  "handhold",
  "cuddle",
  "shy",
  "sigh",
  "pout",
  "mad",
  "tickle",
];

const english: Record<(typeof types)[number], string> = {
  airkiss: "1 gave 2 an airkiss <3",
  angrystare: "1 gave an angry stare to 2",
  bite: "1 bit 2! Ow!",
  bleh: "1 is discontent with 2...",
  blush: "1 is feeling a little blushy around 2 :3",
  brofist: "1 gave 2 a brofist! Yeah!",
  celebrate: "1 is celebrating with 2!",
  cheers: "1 gave 2 a cheers!",
  clap: "1 is clapping for 2, welldone!",
  confused: "1 is a little confused by 2...",
  cool: "1 is acting all cool around 2",
  cry: "1 is crying because of 2...",
  cuddle: "1 is cuddling 2 <3",
  dance: "1 is dancing with 2!",
  drool: "1 is drooling because of 2...",
  evillaugh: "1 is evilly laughing at 2... Mwahaha!",
  facepalm: "1 facepalmed at 2",
  handhold: "1 is holding hands with 2 <3",
  happy: "1 is feeling happy because of 2!",
  headbang: "1 is headbanging with 2!",
  hug: "1 gave 2 a big hug!",
  huh: "1 is confused by 2. Huh?",
  kiss: "1 kissed 2! ❤️",
  laugh: "1 is laughing at 2!",
  lick: "1 licked 2! Weird...",
  love: "1 is feeling lots of love for 2! <3",
  mad: "1 is mad at 2!",
  nervous: "1 is feeling nervous around 2...",
  no: "1 said no to 2!",
  nom: "1 is nomming on 2!",
  nosebleed: "1 got a nosebleed because of 2...",
  nuzzle: "1 is nuzzling 2 affectionately :333",
  nyah: "1 said 'Nyah!' to 2 playfully!!",
  pat: "1 gave 2 a gentle pat on the head",
  peek: "1 is peeking at 2 curiously",
  pinch: "1 pinched 2!",
  poke: "1 poked 2! Boop!",
  pout: "1 is pouting at 2",
  punch: "1 punched 2! Oof!",
  roll: "1 is rolling around with 2.",
  run: "1 is running away from 2!",
  sad: "1 is feeling sad because of 2...",
  scared: "1 is scared of 2!",
  shout: "1 is shouting at 2!",
  shrug: "1 shrugged at 2. Oh well.",
  shy: "1 is feeling shy around 2.",
  sigh: "1 sighed because of 2.",
  sip: "1 is sipping a drink while looking at 2.",
  slap: "1 slapped 2! Ouch!",
  sleep: "1 fell asleep next to 2.",
  slowclap: "1 gave 2 a slow sarcastic clap.",
  smack: "1 smacked 2!",
  smile: "1 is smiling at 2.",
  smug: "1 is looking smug at 2.",
  sneeze: "1 sneezed because of 2. Achoo!",
  sorry: "1 apologized to 2.",
  stare: "1 is staring at 2...",
  stop: "1 told 2 to stop!",
  surprised: "1 is surprised by 2!",
  sweat: "1 is sweating nervously around 2.",
  thumbsup: "1 gave 2 a thumbs up!",
  tickle: "1 is tickling 2!",
  tired: "1 is feeling tired around 2...",
  wave: "1 waved at 2!",
  wink: "1 winked at 2 😉.",
  woah: "1 is amazed by 2! Woah!",
  yawn: "1 yawned at 2... So sleepy.",
  yay: "1 is celebrating with 2! Yay!",
  yes: "1 said yes to 2!",
};

const command: HypnoCommand<{ user?: User }> = {
  name: "action",
  type: "actions",
  eachAliasIsItsOwnCommand: true,
  aliases: [...types],
  description: "Actions on others!",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        type: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, options) => {
    if (options.command === "action") {
      return message.reply(
        `Cool! You wanna use an action! The current actions are: ${command.aliases
          .map((x) => `**${x}**`)
          .join(", ")}`,
      );
    }

    if (
      options.args?.user?.id === message.author.id &&
      ["bite", "kill", "punch"].includes(options.command)
    ) {
      return message.reply(`Hey! Don't do that to yourself :(\nWe love you!`);
    }

    const pronoun = !options.args.user
      ? "someone"
      : options.args.user.id === message.author.id
        ? "themself"
        : `${options.args.user.username}`;

    const result = await axios.get(
      `https://api.otakugifs.xyz/gif?reaction=${options.command}`,
    );

    return message.reply({
      embeds: [
        createEmbed()
          .setTitle(
            english[options.command]
              .replace(/1/g, message.author.username)
              .replace(/2/g, pronoun),
          )
          .setImage(result.data.url),
      ],
    });
  },
};

export default command;
