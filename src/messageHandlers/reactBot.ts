import { messUpSentence } from "../commands/fun/messUpSentence";
import { piglatin } from "../commands/fun/pigLatin";
import config from "../config";
import { HypnoMessageHandler } from "../types/util";
import { randomFromRange } from "../util/other";

const phrases = [
  "skibii sigma",
  "boop",
  "RISE AND GRIND :fire:",
  "Ok hear me out",
  "Who let bro cook?",
  "Chat is this fact or cap?",
  "ZOINKS SCOOB!",
  "I vote you for president!",
  ":)",
  "erm... what da sigma?",
  "spongeboob",
  "Tuna sandwich.",
  "Let me see your bones",
  "Are you always this gay?",
  ">:]",
  ":3c",
  "I love you!",
  "Skull emoji!",
  "This is why I no longer like penguins.",
  "Wowzers!",
  "Brian! Look out!",
  "Ratio",
  "+1",
  "-1",
  "*1",
  "Can we get an uh oh in the chat?",
  "This is why we can't have nice things",
  "Slay!",
  'Erm, is this what the kids call "poggers"?',
  "Smash",
  "This is why it's nerf or nothing",
  "It's so over",
  "STONKS",
  "Erm nuh uh",
  "Kaboom!!!",
  "Throws a brick at you (cutely)",
  "Hate is such a strong word... but I think it's the correct one.",
  "I condone gambling!",
  ".q",
  "You think you're funny, but you're not.",
  "I rizz you <3",
  ".rizz",
  "Nah",
  "Yes!",
  "...",
  "I give this message 5 booms! Boom! Boom! Boom! Boom! Boom!",
  "I give this message 4 booms! Boom! Boom! Boom! Boom!",
  "I give this message 3 booms! Boom! Boom! Boom!",
  "I give this message 2 booms! Boom! Boom!",
  "I give this message 1 booms! Boom!",
  "haha... uhm...",
  "HAHAHAHAHA",
  "You are in fact the best",
  "You are so sigma",
  "This is so skibidi",
  "Erm... what da skibidi?",
  "false",
  "FALSE",
  "true",
  "TRUE",
  "Checkmate liberals!",
  "Oh brother, this guy stinks!",
  "hehehehee",
  "*skidadles*",
  "*Turns you into a Giraffe.*",
  "meow (hypnotically)",
  "woof (scary)",
  "Yea... that's what they all say",
  "Would you like to present this to the class?",
  "pain",
  "ngl... me too",
  "Nanomachines son!",
  "Click the circles!",
  "I... am Steve.",
  "aAAAAaaAAAAAaaAAAAAAAaaAAAAAAaaAAAAA",
  "*Has an existential crisis*",
  "The zombies are coming...",
  "*angry british noises*",
  "Hello, we are about to launch an all - out attack on your houze Sincerely, the Zombies",
  "<:keys:1283581127071891466>",
  "<:bite_lips:1315469148004028537>",
  "i use arch btw",
  "Me when",
  "xd",
  "bruhhh wtf",
  "nah.....",
  "this can't be real",
  "is this what they made the internet for",
  "abcdefghijklmnopqrstuvwxyz",
  "1v1 tictactoe rn",
  "LMAO!",
  "haha.. this is pretty skibidi sigma i must say",
  ":imthebest:",
  ">////<",
  "im telling the teacher!",
  "<@395877903998648322> would like this",
  "maybe you should just like not",
  "i dont shut up, i grow up, and when i look at you, i wanna throw up",
  "-# (edited)",
  "erm... lemme think about that one",
  "maybe next week idk",
  "exclamative",
  "exclamation mark",
  "question mark",
  "reese's puffs reese's puffs eat em up eat em up eat em up!",
  ".rate gay\n\nAccording to my calculation... **you** are... 889,293,112% gay",
];

let messagesSince = 0;
let messagesRequired = 20;

const excludedChannels = ["1315484267517575168"];

const handler: HypnoMessageHandler = {
  name: "react-bot",
  description: "Similar to JJJacksFilm's ReactBot",

  handler: async (message) => {
    if (message.guild.id !== config.botServer.id) return;
    if (message.author.bot) return;
    if (excludedChannels.includes(message.channel.id)) return;
    messagesSince++;

    if (messagesSince >= messagesRequired) {
      try {
        let phrase = phrases[Math.floor(Math.random() * phrases.length)];

        let fuckups = [
          () => piglatin(phrase),
          () => messUpSentence(phrase),
          () => phrase.toUpperCase(),
          () =>
            phrase
              .split("")
              .reduce(
                (c, v) =>
                  c + (Math.random() > 0.7 ? v.toUpperCase() : v.toLowerCase()),
                ""
              ),
        ];
        phrase = fuckups[Math.floor(Math.random() * fuckups.length)]();

        await message.reply(phrase);
        messagesSince = 0;
        messagesRequired = randomFromRange(50, 100);
      } catch {}
    }
  },
};

export default handler;
