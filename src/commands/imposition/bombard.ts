import { HypnoCommand } from "../../types/util";
import { getRandomSpiral } from "../../util/actions/spirals";
import { getUserFavouriteSpirals } from "../../util/actions/userFavouriteSpirals";
import { database } from "../../util/database";
import { getRandomImposition } from "../../util/other";

const validOptions = [
    "nospirals", "allspirals", "noimposition", "dropping", "confirm"
];

const dropping = [
    ["*drop down*", "getting deeper and deeper", "calmer and calmer", "letting that calmness take over"],
    ["slowly starting to feel nice and relaxed", "nice and cozy", "just feeling so good, so peaceful", "each word making you so fuzzy, so thoughtless until you *drop*"],
    ["start breathing... nice and slowly... nice and steadily", "with every inhale... feeling a strong calmness spread across your body", "with every exhale... it's as if... you're blowing away those thoughts", "until you finally... *drop*"]
];

const ups = [
    ["*upupup* all the way up", "nice and aware", "nice and awake"]
]

const command: HypnoCommand = {
    name: "bombard",
    type: "fun",
    description: "Sends spirals & imposition for a while, ups you afterwards."
        + "\n\n**nospirals**: Send no spirals, just imposition"
        + "\n**allspirals**: Send any spirals, including non-favourites"
        + "\n**noimposition**: No imposition, just spirals"
        + "\n**dropping**: Sends a random small induction"
        + "\n**confirm**: Confirm you want to start it",
    examples: [
        ["$cmd 2 dropping confirm", "This will drop you then send spirals/impo for 2 minutes"],
        ["$cmd 1.5 nospirals dropping confirm", "This will drop you and send ONLY impo for 1 and a half minutes"]
    ],

    handler: async (message, { oldArgs: args }) => {
        if (message.author.id === "735109350728663080")
            return message.reply("Nuh uh! *mwah mwah mwah!!! tight hug* courtesy of tiny Dawn");

        // Check for minutes
        if (!args[0] || Number.isNaN(parseFloat(args[0])))
            return message.reply(`Please provide length in minutes as the first argument`);
        let minutes = parseFloat(args.shift());

        if (minutes > 7)
            return message.reply(`Max amount of minutes is 7`);

        // Validate
        for (const i in args) {
            if (!validOptions.includes(args[i]))
                return message.reply(`${args[i]} is an invalid option!\nValid options: ${validOptions.join(", ")}`)
        }

        // Check if it can actually send stuff
        if (args.includes("nospirals") && args.includes("noimposition"))
            return message.reply(`You cannot have both nospirals & noimposition enabled`);

        // Get spirals
        let spirals: Spiral[] = [];
        if (!args.includes("nospirals"))
            if (args.includes("allspirals"))
                spirals = await database.all(`SELECT * FROM spirals;`);
            else spirals = await getUserFavouriteSpirals(message.author.id);

        // Make sure theres at least 3
        if (!args.includes("nospirals"))
            if (spirals.length < 3)
                return message.reply(`There needs to be more than 3 provided spirals. If you are not using "favourite spirals", pass the \`nospirals\` option`)

        // Check for confirmation
        if (!message.channel.isDMBased() && !args.includes("confirm"))
            return message.reply(`Please add the "confirm" option, to confirm you would like to start this`);

        // Check if it should notify the user that they dont have too much setup imposition
        if ((await database.all(`SELECT * FROM user_imposition WHERE user_id = (?)`, message.author.id)).length < 8)
            await message.reply(`You don't have too much imposition set up, it's best to have around 8+`);

        // Send the warning / information message that it is about to start
        await message.reply(
            `I will now mess with you for ${minutes} minutes!\nType "stop" or "up" at anytime to cancel this.`
            + `\n**ANYONE in this channel can say "stop ${message.author.username}" to cancel it too.** :cyclone:`
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
                    if (index >= arr.length)
                        return resolve();

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
            if (args.includes("dropping")) {
                await execute(dropping[Math.floor(Math.random() * dropping.length)]);
            }

            // Main function for sending stuff
            async function doIt() {
                // Check if should stop
                if (stop) return doStop();
                if ((minutes * 60000) - (Date.now() - startTime) < 0) stop = true;

                try {
                    // Check what it should do
                    if (args.includes("noimposition"))
                        await message.channel.send((await getRandomSpiral()).link);
                    else if (args.includes("nospirals"))
                        await message.channel.send(await getRandomImposition(message.author.id, true));
                    else {
                        // It will pick a random thing to do 
                        if (Math.random() > 0.4)
                            await message.channel.send(await getRandomImposition(message.author.id, true));
                        else await message.channel.send((await getRandomSpiral()).link);
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
            filter: msg =>
                (msg.author.id === message.author.id
                    && /((up)+)|(stop)/i.test(msg.content))
                || msg.content.toLowerCase() == `stop ${message.author.username}`
        });

        // Listen for said collections
        collector.on("collect", m => {
            stop = true;
            collector.stop();
            m.reply(`Stopped :cyclone:`);
        });
    }
};

export default command;