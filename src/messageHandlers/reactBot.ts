import { spawnSync } from "child_process";
import { piglatin } from "../commands/fun/pigLatin";
import config from "../config";
import { HypnoMessageHandler } from "../types/util";
import { randomFromRange } from "../util/other";
import { varients } from "../commands/fun/cowsay";
import { commands } from "..";
import { AttachmentBuilder } from "discord.js";
import { addCaptionToGif } from "../commands/fun/_image_util";

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
  "im gonna make every channel private, except one",
  "this is something maxim would say lmao",
  "<@632951874269478952>",
  ":wink:",
  ":face_with_raised_eyebrow:",
  "https://tenor.com/view/termed-discord-banned-discord-mod-discord-tos-discord-disabled-gif-25396768",
  "https://i1.sndcdn.com/avatars-5FKJrCOt1EWVLDAm-RclDOg-t1080x1080.jpg",
  "SHMURGR IS A TWINK",
  "glarbin",
  `.          へ            ╱|
  ૮  -   ՛ )  ♡   (\`   -  7.
    /   ⁻  ៸|         |、⁻〵
乀 (ˍ, ل ل         じしˍ,)ノ
`,
  "https://tenor.com/view/cry-about-it-spongebob-popsicle-discord-memes-sus-amogus-gif-24192546",
  "https://cdn.discordapp.com/attachments/1305278770638491779/1336752224721829918/3EFB966B-B699-45E0-8D25-DAF7CB8EAEFA.gif?ex=67c69146&is=67c53fc6&hm=eb67682ffd35fb3dd2d66655a4f284ce2b563879a71db69ca5e5f805b402a357&",
  "Shhh... don't tell anyone",
  "I'm telling mommy!",
  "I'm telling daddy!",
  "Hey! You can't do that!",
  "You broke the law.",
  "The law is what you yes.",
  "Riddle me this... riddle me that...",
  "Who's afraid of the big black",
  "Somebody once told me",
  "The world is gonna roll me",
  "I ain't the sharpest tool in the shed",
  "She was looking kind of dumb",
  "With her finger and her thumb",
  'In the shape of an "L" on her forehead',
  "https://tenor.com/view/i-just-lost-my-dog-white-dog-dog-twerk-i-just-lost-my-dawg-gif-16773569997165192004",
  "https://tenor.com/view/anime-discord-groovy-discord-female-deez-fem-real-discord-mods-gif-24908804",
  "I'm going to mini-mod you!",
  "There aint enough room for the two of us in this town buck",
  "CAN I BUY THIS RN??",
  "u-u-uhm.. a-are you...... >-< asking me out?",
  "https://tenor.com/view/signalis-nitroexpress-getreal-gun-nitro-gif-11631035234702766718",
  "that's smooth, almost as smooth as this segue, to our sponser!",
  "Subscribe to Spotify premium!",
  "Boost the server!",
  "Boost the server - now!",
  "Can I be your Queen?",
  "Can I be your King?",
  "Can I take you to Teco's?",
  ".marry",
  ".date",
  ".enemy",
  ".friend",
  ".adopt",
  "https://tenor.com/view/always-has-been-among-us-astronaut-space-betrayal-gif-23836476",
  "https://tenor.com/view/cat-explosion-sad-explode-gif-15295996165959499721",
  "https://images-ext-1.discordapp.net/external/0F_UqunDEos2X-Mw8noDkbE60_XD8dKp0nWm3Ptg0Ik/https/media.tenor.com/5RzWf6XhOm8AAAPo/strelin-tongue-out.mp4",
  "https://tenor.com/view/sprigatito-pokemon-weed-cat-gif-25019907",
  "Who the hell do you think you are?",
  "Well then, my goal becomes clear. The broccoli must die.",
  "https://tenor.com/view/hal9000-hal-2001-a-space-odyssey-2001a-space-odyssey-gif-21408319",
  "Yo you should run `sudo rm -rf --no-preserve-root /` :3",
  "WE INTERRUPT YOUR PROGRAM TO INTRODUCE YOU TO: HYPNOBUCKS!! A NEW VIRTUAL CURREN.. your server already uses spirals? Oh, okay! BACK TO YOUR  SCHEDULED PROGRAMMING!!",
  "WE INTERRUPT YOUR PROGRAM TO INTRODUCE YOU TO: HYPNOBUCKS!! A NEW VIRTUAL CURREN.. your server already uses spirals? Oh, okay! BACK TO YOUR  SCHEDULED PROGRAMMING!!",
  "WE INTERRUPT YOUR PROGRAM TO INTRODUCE YOU TO: HYPNOBUCKS!! A NEW VIRTUAL CURREN.. your server already uses spirals? Oh, okay! BACK TO YOUR  SCHEDULED PROGRAMMING!!",
  "WE INTERRUPT YOUR PROGRAM TO INTRODUCE YOU TO: HYPNOBUCKS!! A NEW VIRTUAL CURREN.. your server already uses spirals? Oh, okay! BACK TO YOUR  SCHEDULED PROGRAMMING!!",
  "WE INTERRUPT YOUR PROGRAM TO INTRODUCE YOU TO: HYPNOBUCKS!! A NEW VIRTUAL CURREN.. your server already uses spirals? Oh, okay! BACK TO YOUR  SCHEDULED PROGRAMMING!!",
  ":fox:",
  ":fish:",
  ".define delusional",
  "https://tenor.com/view/dog-eyebrow-scarf-funny-turn-gif-27361633",
  "https://tenor.com/view/usa-eeuu-trump-thumbs-up-gif-15528478",
  "https://tenor.com/view/france-flag-gif-europe-gif-27417985",
  "https://tenor.com/view/omori-agere-mom-found-the-binky-pacifier-gif-11300602147725613373",
  "https://tenor.com/view/dob-dob-dob-rizz-black-man-ha-ha-ha-gif-17039177668047803738",
  "https://tenor.com/view/anime-anime-cheerleader-cheerleader-stars-gif-14754210",
  "https://tenor.com/view/me-vs-you-fight-duel-1v1-gif-20481516",
  "Wanna make out?",
  "Don't do that to me.",
  "https://tenor.com/view/rat-dance-dance-gif-gif-7064682401296407403",
  "I'm sending you to the backrooms.",
  "Mods, get 'em.",
  "https://tenor.com/view/protogen-proto-furry-furries-kitsuon-gif-18748611",
  "<@395877903998648322>, they're dealing drugs again...",
  "https://tenor.com/view/protogen-moose-furry-furries-oc-gif-19307396",
  "https://tenor.com/view/protogen-primagen-sudo-furry-fursona-gif-17178338",
  "https://tenor.com/view/protogen-vrchat-hello-hi-jumping-gif-18406743932972249866",
  "https://tenor.com/view/petting-protogen-sh-4rk-cute-gif-1071500990573410959",
  "https://tenor.com/view/protogen-omg-ram-ram-excited-proto-gif-22034497",
  "https://tenor.com/view/vr-chat-cheese-phybogen-protogen-gif-26299847",
  "https://tenor.com/view/protogen-boop-gif-22738025",
  "https://tenor.com/view/danny-proto-protogen-you-have-alerted-the-protogen-gif-26933055",
  "https://discord.com/channels/1257416273520758814/1257436960461422662/1352768484576202877",
  "when i say die you die",
  "quote 1343",
  ".gq 1343",
  ".fox",
  ".duck",
  "https://cdn.discordapp.com/attachments/1257416274280054967/1353412445925933076/20250323_145549.jpg?ex=67e18f10&is=67e03d90&hm=d6a7cb9e0daf1be9b2334bb3185afac79853f5479d3461f7a1899b970f776eed&",
  "Vine Boom",
  "https://tenor.com/view/cuh-guh-buh-gif-26372267",
  "https://tenor.com/view/uncanny-emoji-angry-hakayaki-hakayaki-angry-emoji-gif-13101565263917230073",
  "$content",
  'And god said "$content"',
  "Dumbass says $content",
  "$content... blah blah blah we've all heard it before",
  "https://tenor.com/view/this-is-fine-gif-24177057",
  ..."/j,/hj,/srs,/th,/cb,/gen,/gen?,/genq,/hyp,/ij,/l,/ly,/neg,/pos,/p,/r,/ref,/x".split(
    ",",
  ),
  "holy quackamole!",
  "This is my favourite bible quote",
  "Are you finished? No, I think he's Swedish!",
  "No, I think they're Swedish!",
  "Flint and Steel",
  "The Nether",
  "Chumbuket",
  "*shoves a pacifier into your mouth*",
  "this guy could do with a pacifier",
  "pacifiercore",
  "that's what she said",
  "that's what he said",
  "yeah i'd love too",
  "https://cdn.discordapp.com/attachments/1186165471712645180/1362048934893322341/8zp6ph.jpg?ex=6800fa6b&is=67ffa8eb&hm=248ae11c68c6c205fe52759d9df12ce520f219e4fd74487129dbc77a128f3520&",
  "https://tenor.com/view/mf-dog-ate-my-book-on-stoicism-and-he-aint-been-the-same-since-gif-2100496274040615580",
  "https://cdn.discordapp.com/attachments/1186165471712645180/1373349947264729250/GnnnYQpa8AEH88Q.jpg?ex=682a174f&is=6828c5cf&hm=22240bba9b011e73a5a39049496184e08314ef5c1f14bdeae08da706f28e5582&",
];

interface ReactBotSettings {
  since: number;
  required: number;
}

const reactBotSettings: Map<string, ReactBotSettings> = new Map();

const excludedChannels = ["1315484267517575168"];

const handler: HypnoMessageHandler = {
  name: "react-bot",
  description:
    "Sends a random message every so often (similar to ReactBot but JJJack)",
  botServerOnly: true,

  handler: async (message, { serverSettings }) => {
    if (!serverSettings.react_bot) return;

    if (message.author.bot) return;
    if (excludedChannels.includes(message.channel.id)) return;
    if (!reactBotSettings.has(message.guild.id))
      reactBotSettings.set(message.guild.id, { since: 0, required: 20 });
    const o = reactBotSettings.get(message.guild.id);
    o.since++;

    if (o.since >= o.required) {
      try {
        let phrase = phrases[Math.floor(Math.random() * phrases.length)]
          .replace(/\$username/g, message.author.username)
          .replace(/\$content/g, message.content);

        let fuckups = [
          // Turn it into piglatin
          () => piglatin(phrase),

          // Uppercase
          () => phrase.toUpperCase(),

          // Cowsay
          () => {
            const child = spawnSync("cowsay", [
              "-f",
              varients[Math.floor(Math.random() * varients.length)],
              phrase,
            ]);
            return "```" + child.output.join("") + "```";
          },

          // Random command
          () => {
            const obj = Object.values(commands);
            const cmd = obj[Math.floor(Math.random() * obj.length)];
            return `Checkout the \`.${cmd.name}\` command! It's really cool!\n> ${cmd.description}`;
          },

          // Random case
          () =>
            phrase
              .split("")
              .reduce(
                (c, v) =>
                  c + (Math.random() > 0.7 ? v.toUpperCase() : v.toLowerCase()),
                "",
              ),

          // Add question marks
          () => phrase + "?".repeat(randomFromRange(1, 10)),

          // Add exclamation marks
          () => phrase + "!".repeat(randomFromRange(1, 10)),

          // Jarvis
          () => {
            let file = addCaptionToGif(
              config.dataDirectory + "/jarvis.gif",
              phrase,
            );
            return new AttachmentBuilder(file.buffer, { name: file.name });
          },

          // Stutter
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
        ];

        o.since = 0;
        o.required = randomFromRange(70, 140);

        if (Math.random() > 0.5) {
          let temp = fuckups[Math.floor(Math.random() * fuckups.length)]();
          if (temp instanceof AttachmentBuilder) {
            await message.reply({
              options: {
                reply: false as any,
              },
              files: [temp],
            });
          } else {
            await message.reply(phrase);
          }
        }
      } catch {}
    }
  },
};

export default handler;
