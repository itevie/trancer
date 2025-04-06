import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ prompt: string }> = {
  name: "mirrormirroronthewall",
  aliases: [
    "mirror-mirror-on-the-wall",
    "mirror_mirror_on_the_wall",
    "mmotw",
    "motw",
    "mirror",
  ],
  description: "Mirror mirror on the wall... who's the wisest of them all?",
  type: "fun",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "prompt",
        type: "string",
        takeContent: true,
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const users = new Array(
      ...new Set(
        (
          await message.channel.messages.fetch({
            limit: 50,
          })
        ).map((x) => x.author),
      ),
    );
    const user = users[Math.floor(Math.random() * users.length)];

    return message.reply({
      embeds: [
        createEmbed()
          .setTitle("Mirror mirror on the wall...")
          .setDescription(`...${args.prompt}\n\n**${user.username}**`)
          .setThumbnail(
            "https://cdn.discordapp.com/attachments/1257417475621130351/1353036896304893993/189933.png?ex=67e0314e&is=67dedfce&hm=bb5351023340d7414e130312399d3aacff39742aacf08fb5984627dc2ca63038&",
          )
          .setImage(
            user.displayAvatarURL({
              size: 2048,
            }),
          ),
      ],
    });
  },
};

export default command;
