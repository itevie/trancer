import { Guild, GuildMember, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import ConfirmAction from "../../util/components/Confirm";
import { createEmbed } from "../../util/other";
import { messages } from "../help/help";

const command: HypnoCommand = {
  name: "sendbotonboarding",
  description: "Sends the bot onboarding message to every server owner",
  type: "admin",
  guards: ["admin", "bot-owner", "bot-server"],

  handler: async (message) => {
    const fakeServers = await message.client.guilds.fetch();
    const owners: GuildMember[] = [];
    for await (const [_, server] of fakeServers) {
      const s = await server.fetch();
      const owner = await s.fetchOwner();
      if (!owners.some((x) => x.id === owner.id)) owners.push(owner);
    }

    ConfirmAction({
      message,
      embed: createEmbed().setTitle(
        `Are you sure you want to send the onboarding message to the following users: ${owners.map(
          (x) => x.user.username
        )}`
      ),
      async callback() {
        for await (const owner of owners) {
          try {
            await owner.send({
              content: `:information_source: This message was retroactively sent to all servers with Trancer in it.`,
              ...messages["join-server"],
            });
          } catch (e) {
            console.log(e);
          }
        }
        return {
          embeds: [
            createEmbed()
              .setTitle("Sent")
              .setDescription(
                `Successfully sent the message to ${owners.length} owners!`
              ),
          ],
        };
      },
    });
  },
};

export default command;
