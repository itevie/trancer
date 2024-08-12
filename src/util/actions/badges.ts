import { AquiredBadge } from "../../types/aquiredBadge";
import { database } from "../database";

export async function getAllAquiredBadges(): Promise<AquiredBadge[]> {
    return (await database.all(`SELECT * FROM aquired_badges;`)) as AquiredBadge[]
}

export async function getAllAquiredBadgesFor(userId: string): Promise<AquiredBadge[]> {
    return (await database.all(`SELECT * FROM aquired_badges WHERE user = ?;`, userId)) as AquiredBadge[]
}

export async function addBadgeFor(userId: string, badgeName: string): Promise<void> {
    console.log(`Added badge ${badgeName} for ${userId}`);
    await database.run(`INSERT INTO aquired_badges (user, badge_name) VALUES (?, ?)`, userId, badgeName);
}

export async function removeBadgeFor(userId: string, badgeName: string): Promise<void> {
    console.log(`Removed badge ${badgeName} for ${userId}`);
    await database.run(`DELETE FROM aquired_badges WHERE user = ? AND badge_name = ?;`, userId, badgeName);
}