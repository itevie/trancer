import { HypnoCommand } from "../../types/command";
import { getServerSettings } from "../../util/actions/settings";
import { createEmbed, gcd } from "../../util/other";

const command: HypnoCommand = {
    name: "roles",
    aliases: ["subs", "tists"],
    description: "Get the ratio of subs : tists",

    handler: async (message, _) => {
        // Collect data
        const serverSettings = await getServerSettings(message.guild.id);
        const members = await message.guild.members.fetch();
        let tists = 0;
        let subs = 0;
        let switches = 0;

        // Loop through members
        members.forEach(member => {
            if (member.roles.cache.has(serverSettings.tist_role_id))
                tists++;
            if (member.roles.cache.has(serverSettings.sub_role_id))
                subs++;
            if (member.roles.cache.has(serverSettings.switch_role_id))
                switches++;
        });

        const r = gcd(subs, tists);

        return message.reply({
            embeds: [
                createEmbed()
                    .setTitle("Amount of the roles")
                    .setDescription(
                        `**Subs**: ${serverSettings.sub_role_id ? subs : "*Role not set*"}` +
                        `\n**Tists**: ${serverSettings.tist_role_id ? tists : "*Role not set*"}` +
                        `\n**Switches**: ${serverSettings.switch_role_id ? switches : "*Role not set*"}` +
                        (serverSettings.sub_role_id && serverSettings.tist_role_id
                            ? `\n**Ratio (sub:tist)**: ${subs / r}:${tists / r}`
                            : "")
                    )
            ]
        })
    }
}

export default command;