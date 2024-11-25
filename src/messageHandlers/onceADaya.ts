import config from "../config";
import { HypnoMessageHandler } from "../types/util";
import { randomFromRange } from "../util/other";

const phrases = [
  "faggot",
  "skibii sigma",
  "fuck you",
  "twink",
  "boop",
  "RISE AND GRIND :fire:",
  "Ok hear me out",
  "Who let bro cook?",
  "Chat is this fact or cap?",
  "ZOINKS SCOOB!",
  "I vote you for president!",
  "die /j",
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
  "Cope",
  "Erm nuh uh",
  "Kaboom!!!",
  "Throws a brick at you (cutely)",
  "Hate is such a strong word... but I think it's the correct one.",
  "I condone gambling!",
];

let messagesSince = 0;
let messagesRequired = 0;

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
        messagesRequired = randomFromRange(25, 100);
      } catch {}
    }
  },
};

export default handler;
