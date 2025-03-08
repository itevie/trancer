import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";
import { getRandomImposition } from "../../util/other";

const validOptions = [
  "nospirals",
  "allspirals",
  "noimposition",
  "dropping",
  "confirm",
];

const dropping = [
  [
    "*drop down*",
    "getting deeper and deeper",
    "calmer and calmer",
    "letting that calmness take over",
  ],
  [
    "slowly starting to feel nice and relaxed",
    "nice and cozy",
    "just feeling so good, so peaceful",
    "each word making you so fuzzy, so thoughtless until you *drop*",
  ],
  [
    "start breathing... nice and slowly... nice and steadily",
    "with every inhale... feeling a strong calmness spread across your body",
    "with every exhale... it's as if... you're blowing away those thoughts",
    "until you finally... *drop*",
  ],
  [
    "imaagine a hand...",
    "fluttering around your vision...",
    "this way and that...",
    "until it finally... *drops*",
  ],
];

const ups = [["*upupup* all the way up", "nice and aware", "nice and awake"]];

const command: HypnoCommand<{
  user?: User;
  spirals?: "none" | "all" | "favorite";
  dropping?: boolean;
  length: number;
  imposition?: boolean;
  confirm?: boolean;
}> = {
  name: "bombard",
  type: "hypnosis",
  description: "Sends spirals & imposition for a while, ups you afterwards.",
  examples: [
    [
      "$cmd 2 ?dropping ?confirm",
      "This will drop you then send spirals/impo for 2 minutes",
    ],
    [
      "$cmd 1.5 ?spirals none ?dropping ?confirm",
      "This will drop you and send ONLY impo for 1 and a half minutes",
    ],
    ["$cmd 1.5 ?s none ?d ?c", "Short hand for the previous example"],
  ],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "length",
        type: "number",
        min: 0.1,
        max: 7,
        description: "How long you want the bombard to go on for",
      },
      {
        name: "spirals",
        aliases: ["s"],
        wickStyle: true,
        type: "string",
        oneOf: ["none", "all", "favorite"],
        description:
          "Disable or add all spirals. Leaving it blank = favourite spirals",
      },
      {
        name: "imposition",
        wickStyle: true,
        aliases: ["i"],
        type: "boolean",
        description: "Whether or not to send imposition, default is true",
      },
      {
        name: "dropping",
        wickStyle: true,
        aliases: ["d"],
        type: "boolean",
        description: "Whether or not to add a tiny induction",
      },
      {
        name: "confirm",
        wickStyle: true,
        aliases: ["c"],
        type: "boolean",
        description: "Confirm the bombard - required",
      },
      {
        name: "user",
        wickStyle: true,
        aliases: ["for", "u"],
        type: "user",
        description: "The user to the bombard for",
      },
    ],
  },

  handler: async (message, { args }) => {
    /*if (user.id === "735109350728663080")
            return message.reply("Nuh uh! *mwah mwah mwah!!! tight hug* courtesy of tiny Dawn");*/

    const minutes = args.length;
    const _spirals = args.spirals ?? "favorite";
    const imposition = args.imposition ?? true;
    const confirm = args.confirm ?? false;
    const _dropping = args.dropping ?? false;

    let user = message.author;

    if (args.user) {
      if (
        !(await actions.triggers.trustedTists.getListFor(args.user.id)).some(
          (x) => x.trusted_user_id === user.id
        )
      )
        return message.reply(`You are not on this person's trusted tist list.`);
      user = args.user;
    }

    // Check if it can actually send stuff
    if (!imposition && _spirals === "none")
      return message.reply(
        `You need to have at least imposition or spirals enabled!`
      );

    // Get spirals
    let spirals: Spiral[] = [];
    switch (_spirals) {
      case "all":
        spirals = await database.all("SELECT * FROM spirals;");
        break;
      case "favorite":
        spirals = await actions.spirals.favourites.getFor(user.id);
        break;
    }

    if (_spirals !== "none" && spirals.length < 3)
      return message.reply(
        `There needs to be more than 3 spirals provided. You might not have any favourite spirals. Try adding \`?spirals none\` or \`?spirals all\``
      );

    // Check for confirmation
    if (!message.channel.isDMBased() && !confirm)
      return message.reply(
        `Please add \`?confirm\` to your command to make sure you want to start this`
      );

    // Check if it should notify the user that they dont have too much setup imposition
    if (
      (
        await database.all(
          `SELECT * FROM user_imposition WHERE user_id = (?)`,
          user.id
        )
      ).length < 8
    )
      await message.reply(
        `You don't have too much imposition set up, it's best to have around 8+`
      );

    // Send the warning / information message that it is about to start
    await message.reply(
      `I will now mess with you for ${minutes} minutes!\nType "stop" or "up" at anytime to cancel this.` +
        `\n**ANYONE in this channel can say "stop ${user.username}" to cancel it too.** :cyclone:`
    );
    const startTime = Date.now();
    let stop = false;

    // Function to execute a set of strings
    function execute(arr: string[]): Promise<void> {
      return new Promise<void>((resolve, _) => {
        let index = 0;

        // Send the next one
        async function next() {
          // Check if it as finished
          if (index >= arr.length) return resolve();

          // Send the message
          try {
            await message.channel.send(arr[index]);
          } catch (e) {
            console.log(e);
          }
          index++;

          // Set timeout for the next part of the drop/up
          setTimeout(() => {
            next();
          }, Math.max(2000, Math.floor(Math.random() * 4) * 1000));
        }

        next();
      });
    }

    // Execute the stop
    async function doStop() {
      // Send a up
      await execute(ups[Math.floor(Math.random() * ups.length)]);
      collector.stop();
      return message.channel.send("I am now done! :cyclone:");
    }

    // Timer before it starts for them to read the intitial message
    setTimeout(async () => {
      // Do a drop if they wanted it
      if (_dropping) {
        await execute(dropping[Math.floor(Math.random() * dropping.length)]);
      }

      // Main function for sending stuff
      async function doIt() {
        // Check if should stop
        if (stop) return doStop();
        if (minutes * 60000 - (Date.now() - startTime) < 0) stop = true;

        try {
          // Check what it should do
          const toSend: string = "";

          if (!imposition)
            await message.channel.send(
              (
                await actions.spirals.getRandom()
              ).link
            );
          else if (_spirals === "none")
            await message.channel.send(
              await getRandomImposition(user.id, true)
            );
          else {
            // It will pick a random thing to do
            if (Math.random() > 0.4)
              await message.channel.send(
                await getRandomImposition(user.id, true)
              );
            else
              await message.channel.send(
                (
                  await actions.spirals.getRandom()
                ).link
              );
          }
        } catch (e) {
          console.log(e);
        }

        // Set the timeout for it to do it again
        setTimeout(() => {
          doIt();
        }, Math.max(1000, Math.floor(Math.random() * 7) * 1000));
      }

      doIt();
    }, 3000);

    // Collect messages for if a user tells it to stop
    const collector = message.channel.createMessageCollector({
      filter: (msg) =>
        (msg.author.id === user.id && /((up)+)|(stop)/i.test(msg.content)) ||
        msg.content.toLowerCase() == `stop ${user.username}`,
    });

    // Listen for said collections
    collector.on("collect", (m) => {
      stop = true;
      collector.stop();
      m.reply(`Stopped :cyclone:`);
    });
  },
};

export default command;
