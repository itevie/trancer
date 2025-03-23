import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";

const positive = [
  "It is certain",
  "It is decidedly so",
  "Without a doubt",
  "Yes definitely",
  "You may rely on it",
  "As I see it, yes",
  "Most likely",
  "Outlook good",
  "Yes",
  "Signs point to yes",
];

const neutral = [
  "Reply hazy, try again",
  "Ask again later",
  "Better not tell you now",
  "Cannot predict now",
  "Concentrate and ask again",
];

const negative = [
  "Don't count on it",
  "My reply is no",
  "My sources say no",
  "Outlook not so good",
  "Very doubtful",
];

const all = [...positive, ...neutral, ...negative];

const command: HypnoCommand<{ question?: string }> = {
  name: "8ball",
  aliases: ["8b", "magic8ball"],
  description: "Ask the magical 8ball",
  type: "fun",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "question",
        type: "string",
        infer: true,
        takeContent: true,
      },
    ],
  },

  handler: (message) => {
    const selected = all[Math.floor(Math.random() * all.length)];

    return message.reply({
      embeds: [
        createEmbed()
          .setTitle("Magical 8ball")
          .setDescription(selected)
          .setColor(
            positive.includes(selected)
              ? "#00FF00"
              : neutral.includes(selected)
                ? "#FFFF00"
                : "#FF0000",
          )
          .setThumbnail(
            "https://cdn.discordapp.com/attachments/1257417475621130351/1353034264257761433/8ball.png?ex=67e02eda&is=67dedd5a&hm=c52e79c925edde50c2c2b14f642931c4305e98c014e6d348f3a6718ca368e580&",
          ),
      ],
    });
  },
};

export default command;
