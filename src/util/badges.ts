import { client } from "..";
import { AquiredBadge } from "../types/aquiredBadge";
import { addBadgeFor, getAllAquiredBadges } from "./actions/badges";
import { database } from "./database";

interface Badge {
    name: string,
    description: string,
    emoji: string,
    scan: () => any,
}

const badges: { [key: string]: Badge } = {
    "yapper": {
        name: "Yapper",
        description: "Sent 1000 messages",
        emoji: ":speaking_head:",
        scan: async () => {
            const users = await database.all(`SELECT * FROM user_data;`) as UserData[];
            const aquired = await getAllAquiredBadges();

            for (const user of users) {
                if (user.messages_sent > 1000 && !aquired.find(x => x.user === user.user_id && x.badge_name === "yapper"))
                    await addBadgeFor(user.user_id, "yapper")
            }
        }
    },
    "og": {
        name: "Founder",
        description: "Joined the server before 100 members",
        emoji: ":snowflake:",
        scan: async () => {
            const aquired = await getAllAquiredBadges();
            let members = await (await client.guilds.fetch("1257416273520758814")).members.fetch();
            for (let i of members.entries()) {
                if (!aquired.find(x => x.user === i[1].user.id && x.badge_name === "og"))
                    await addBadgeFor(i[1].user.id, "og");
            }
        }
    }
} as const;

export default badges;

export function checkBadges() {
    for (const i in badges) {
        badges[i].scan();
    }
}

export function formatBadges(badges: Badge[] | { [key: string]: Badge }): string[] {
    let result = [];

    for (let i in badges) {
        result.push(`${badges[i].emoji} \`${badges[i].name}\`: ${badges[i].description}`);
    }

    return result;
}

export function formatAquiredBadges(aquiredBadges: AquiredBadge[]): string[] {
    return formatBadges(aquiredBadges.map(x => badges[x.badge_name]));
}