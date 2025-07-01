import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { randomFromRange } from "../../util/other";
import { actions } from "../../util/database";
import { units } from "../../util/ms";

const down = [
  "Down down down, all the way down...",
  "*snap*",
  "Drop.",
  "Drop deep.",
  "Down! Down! Down!",
  "3... 2... 1... *drop!*",
  "Back in trance... *snap*",
  "*snap* back down into the void",
  "*snap snap snap*",
  "Sinking...",
  "sink",
  "Drifting...",
  "Drifting so far away..",
];

const up = [
  "Now, up up up, all the way up!",
  "Rising to the clouds!",
  "Picking you up from that trancy void...",
  "Bringing you back up!",
  "*up up up*",
  "Ignore the next drop...",
  "*up pat up pat*",
  "Lifting up like a balloon!",
];

const command: HypnoCommand<{
  time: number;
  triggers?: boolean;
  frequency?: number;
}> = {
  name: "fractionation",
  aliases: ["frac"],
  type: "hypnosis",
  description: "Brings you down then up then down then up!",

  args: {
    requiredArguments: 1,
    args: [
      {
        type: "number",
        name: "time",
        description: "Time in minutes",
        min: 0.1,
        max: 7,
      },
      {
        type: "boolean",
        name: "triggers",
        description: "Whether or not to use triggers (default yes)",
        wickStyle: true,
        aliases: ["t"],
      },
      {
        type: "number",
        name: "frequency",
        description:
          "How often it will send them. This is the base, there is a min/max based on this. Default is 5",
        min: 1,
        max: 10,
        aliases: ["f"],
      },
    ],
  },

  handler: async (message, { args }) => {
    const botMessage = await message.reply({
      content: "Click this to confirm you want to start!",
      components: [
        // @ts-ignore
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel("Start")
            .setCustomId("start"),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel("Cancel (anyone can press)")
            .setCustomId("end"),
        ),
      ],
    });

    const collector = botMessage.createMessageComponentCollector();

    let startTime: number | null = null;
    let past: string | null = null;
    let done: boolean = false;
    let needDrop: boolean = true;

    collector.on("collect", async (i) => {
      // start && not user
      if (i.customId === "start" && i.user.id !== message.author.id)
        return i.reply({
          content: "You cannot start it as you didn't run this command!",
          options: { ephemeral: true },
        });
      // end
      else if (i.customId === "end") {
        done = true;
        await botMessage.edit({
          content: "Ended!",
          components: [],
        });
        await i.reply({
          content: "It has been ended!",
          options: { ephemeral: true },
        });
        return;
        // start && already started
      } else if (i.customId === "start" && done) {
        return i.reply({
          content: "It has already been started",
          options: { ephemeral: true },
        });
      }

      await i.reply({
        content: "Starting! Enjoy!",
        options: { ephemeral: true },
      });

      startTime = Date.now();

      async function send() {
        let part: string;

        do {
          part =
            needDrop || Math.random() > 0.66
              ? down[Math.floor(Math.random() * down.length)]
              : !args.triggers || Math.random() > 0.5
                ? up[Math.floor(Math.random() * up.length)]
                : (
                    await actions.triggers.getRandomByTagFor(
                      message.author.id,
                      ["bombard"],
                    )
                  ).what;
        } while (past == part);
        past = part;
        needDrop = false;
        await message.channel.send(part);

        if (Date.now() - startTime >= units.minute * args.time) {
          return message.channel.send({
            content: `*up up up*, I'm all done! I hope you enjoyed our little session :cyclone:`,
          });
        }

        setTimeout(
          () => {
            if (!done) send();
          },
          randomFromRange(
            (args.frequency ?? 5) * 100,
            (args.frequency ?? 5) * 300,
          ),
        );
      }

      send();
    });
  },
};

export default command;
