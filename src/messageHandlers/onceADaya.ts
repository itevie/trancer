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
];

let messagesSince = 0;
let messagesRequired = 20;

const handler: HypnoMessageHandler = {
  name: "once-a-day",
  description: "Responds to a random message once a day",

  handler: async (message) => {
    if (message.guild.id !== config.botServer.id) return;
    if (message.author.bot) return;
    messagesSince++;

    if (messagesSince >= messagesRequired) {
      try {
        await message.reply(
          phrases[Math.floor(Math.random() * phrases.length)]
        );
        messagesSince = 0;
        messagesRequired = randomFromRange(50, 100);
      } catch {}
    }
  },
};

export default handler;
