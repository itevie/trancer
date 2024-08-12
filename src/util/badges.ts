import { client } from "..";
import { AquiredBadge } from "../types/aquiredBadge";
import { addBadgeFor, getAllAquiredBadges, removeBadgeFor } from "./actions/badges";
import { getAllEconomy } from "./actions/economy";
import { database } from "./database";

interface Badge {
    name: string,
    description: string,
    emoji: string,
    scan: () => any,
}

async function handleEcoPositionalBadges() {
    let economy = (await getAllEconomy()).sort((a, b) => b.balance - a.balance);
    let badges = await getAllAquiredBadges();

    // Get current ones
    let first = economy[0].user_id;
    let second = economy[1].user_id;
    let third = economy[2].user_id;

    // Get database ones
    let dbFirst = badges.find(x => x.badge_name === "eco#1")?.user || "-1";
    let dbSecond = badges.find(x => x.badge_name === "eco#2")?.user || "-1";
    let dbThird = badges.find(x => x.badge_name === "eco#3")?.user || "-1";

    // Check if they are same
    if (first !== dbFirst) {
        await removeBadgeFor(dbFirst, "eco#1");
        await addBadgeFor(first, "eco#1");
    }

    if (second !== dbSecond) {
        await removeBadgeFor(dbSecond, "eco#2");
        await addBadgeFor(second, "eco#2");
    }

    if (third !== dbThird) {
        await removeBadgeFor(dbThird, "eco#3");
        await addBadgeFor(third, "eco#3");
    }
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
            return;
        }
    },
    "eco#1": {
        name: "Economy #1",
        description: "At economy position #1",
        emoji: ":first_place:",
        scan: handleEcoPositionalBadges,
    },
    "eco#2": {
        name: "Economy #2",
        description: "At economy position #2",
        emoji: ":second_place:",
        scan: () => { },
    },
    "eco#3": {
        name: "Economy #3",
        description: "At economy position #3",
        emoji: ":third_place:",
        scan: () => { },
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