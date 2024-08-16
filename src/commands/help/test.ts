import { User } from "discord.js";
import { HypnoCommand } from "../../types/command";
import { createEmbed } from "../../util/other";
import getInviteDetails from "../../util/getInviteDetails";

const command: HypnoCommand<{ user: User }> = {
    name: "invitedetails",
    type: "help",
    botOwnerOnly: true,

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "user",
                type: "user"
            }
        ]
    },

    handler: async (message, { args }) => {
        let result = await getInviteDetails(message.client, message.guild.id, args.user.id);

        if (!result)
            return message.reply("Failed to fetch the details!");

        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle(`Invitation details of ${args.user.username}`)
                    .setDescription(
                        `**Invite Code**: ${result.inviteCode}\n`
                        + `**Inviter**: <@${result.inviterId}>`
                    )
            ]
        });
    }
};

export default command;