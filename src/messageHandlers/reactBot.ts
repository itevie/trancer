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
  ".rate gay\n\nAccording to my calculation... **$username** are... 889,293,112% gay",
  "brick",
  "lightly weathered cut copper stairs",
  "are you british?",
  "https://tenor.com/view/yippee-gif-12598976956267201998",
  "Why did the chicken cross the road?",
  "rawr~ x3",
  "i love hypnosis",
  "Τρώω εσύ.",
  "ik hou van je moeder",
  "<3",
  "meow meow im a cow",
  "hey $username, are you a cow?",
  "Everybody do the flop!",
  "It's muffin time!",
  "I like trains.",
  "I'm going to do an internet!",
  "Beep beep, I'm a sheep",
  "I baked you a pie!",
  "There's something on your face!\n\n||*BOOP* IT WAS PAIN.||",
  "I have no idea how to breathe.",
  "this should be an asdf movie skit",
  "/bump",
  ".fish",
  ".daily",
  ".connect4 $username 694 ?h 12 ?w 12",
  "https://www.irs.gov/",
  "https://archlinux.org/",
  "rip",
  "lol",
  "I'm Trancer.",
  "im getting the mudkip on you",
  "hi $username",
  "Did you know that your username is $username?",
  "To be or not to be... that is one of the questions.",
  "squidward's clarinet.",
  "anyway",
  "this is scary",
  "$username, why did you post this?",
  "So you were typing the letters out on your keyboard, conciously writing it, and you were also visually seeing, and reading in your mind what you was writing, yet you still sent this message. Why?",
  "Welldone! You levelled up from level **1** to level **0**! :cyclone:",
  "Welldone! You levelled up from level **69** to level **420**! :cyclone:",
  "phew",
  "who let you out of the trash can",
  "real",
  "*pings everyone*",
  "get dot q'd",
  "$username",
  "hehehehehe",
  "eheheh hey louis eheheh get a load of this guy louis hehehehe",
  "(o_o)",
  "they should add this in the next update",
  "_ _",
  "i call cap",
  "Playing PowerWash Simulator",
  "to be precise",
  ":nerd::point_up:",
  "IM BAKING U IDIOT",
  "pneumonoultramicroscopicsillicovolcanoconiosis",
  "(real)",
  "real?",
  "meh",
  "I sawed this boat in half!",
  "This can be fixed with flextape",
  "Gamble. Rn. Do it. .rcf it all. Do it. I dare you. You won't.",
  "one piece? more like no pieces, cause i evaporated it",
  "imma just sit back and eat some popcorn",
  "oh no...",
  "take this to <#1272735665737564261> pls",
  "https://tenor.com/view/virtual-sin-forgiveness-virtual-sin-virtual-sin-tiktok-sin-forgiveness-gif-12707700347974879749",
  "https://dea.gov/",
  "https://nsa.gov/",
  "https://gov.uk/",
  "Meine Mama hat mir einfach erlaubt dass ich Cola trinken darf! Wie cool ist das bitte? Jetzt zocke ich Fortnite und trinke Cola! YIPPEE!",
  "Buy a lottery ticket RIGHT now.",
  "yip yip yip yip yip yip",
  "*forces you to use arch*",
  "*puts my feet (that have stripey thigh highs on) up on the desk*, yea i use arch btw, how could you tell?",
  "https://discord.gg/xrjcHcAsj2",
  "i dont like you",
  "i dont love you",
  "i like you",
  "i hate you",
  "i dont hate you",
  "i dont not hate you",
  "i dont not not not like you",
  "lmao 1+1 energy right here",
  "bad aura",
  "good aura",
  "what would jesus say?",
  "uh huh...",
  "ok",
  "egg",
  "me when",
  "xd",
  "baby gronk",
  "ohio rizz",
  "ohio gyatt",
  "double pump shotgun",
  "golden scar",
  "anyone got a big pot?",
  "everyone knows im in the thick of it",
  "Want a break from the ads?",
  "Bro's speaking Yapanese",
  "https://tenor.com/view/yuh-uh-meme-funny-nuh-uh-gif-4499945910302690705",
  "https://tenor.com/view/nuh-uh-beocord-no-lol-gif-24435520",
];

const brainrot = (
  "baby gronk,ayo,baka,:cap:,ahh,alpha,among us,aura,ayo,backrooms,bussin',before gta 6,cap,chungus,cooked," +
  "cringe,delulu,discord mod,Dr. DisRespect,fanum-tax,feastables,fent,fortnite battle pass,freaky,gacha life,glazing,glizzy,giddy," +
  "grimace shake,gyatt,hawk tuah,hear me out,i am Steve,ipad kid,kai cenat,ksi,L,ligma,lil' bro,lock in,looksmaxxing,lock in," +
  "luckly,mah boi,mid,mewing,minecraft movie,ohio,phonk,poggers,pookie,quandale dingle,ratio,redditor,rizz,the rizzler," +
  "sigma,skibidi,skibidi toilet,slay,squid game,sus,thick of it,very demure,demure,zesty"
).split(",");

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
        let phrase = phrases[
          Math.floor(Math.random() * phrases.length)
        ].replace(/\$username/g, message.author.username);

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
          () => phrase + "?".repeat(randomFromRange(1, 10)),
          () => phrase + "!".repeat(randomFromRange(1, 10)),
          () => {
            let text = "";
            const amount = randomFromRange(1, 7);
            for (let i = 0; i != amount; i++)
              text += brainrot[Math.floor(Math.random() * brainrot.length)];
            return text;
          },
          () => {
            let words = phrase.split(" ");
            let newWords: string[] = [];
            for (const word of words) {
              if (Math.random() > 0.5) {
                let letter = word[0];
                let amount = randomFromRange(1, 5);
                newWords.push(`${letter}-`.repeat(amount) + word);
              }
            }
            return newWords.join(" ");
          },
          () =>
            phrase
              .split(" ")
              .reduce(
                (c, v) =>
                  c +
                  ` ${
                    Math.random() > 0.3
                      ? `${
                          brainrot[Math.floor(Math.random() * brainrot.length)]
                        } `
                      : ""
                  }${
                    Math.random() > 0.2
                      ? `${
                          brainrot[Math.floor(Math.random() * brainrot.length)]
                        } `
                      : ""
                  }${
                    Math.random() > 0.1
                      ? `${
                          brainrot[Math.floor(Math.random() * brainrot.length)]
                        } `
                      : ""
                  }${v} `,
                ""
              ),
        ];
        if (Math.random() > 0.5)
          phrase = fuckups[Math.floor(Math.random() * fuckups.length)]();
        if (Math.random() > 0.8)
          phrase = fuckups[Math.floor(Math.random() * fuckups.length)]();

        await message.reply(phrase);
        messagesSince = 0;
        messagesRequired = randomFromRange(20, 70);
      } catch {}
    }
  },
};

export default handler;
