import { EmbedBuilder } from "discord.js";
import { createEmbed, randomFromRange } from "./other";
import makePercentageASCII from "./percentageMaker";
import { addMoneyFor, getEconomyFor } from "./actions/economy";
import config from "../config";
import { database } from "./database";

interface DawnagotchiRequirements {
    feed: number,
    drink: number,
    play: number,
}

export function generateDawnagotchiEmbed(dawn: Dawnagotchi, moreDetails: boolean = false): EmbedBuilder {
    let requirements = getDawnagotchiRequirements(dawn);

    return createEmbed()
        .setTitle(`Dawnagotchi details`)
        .addFields([
            {
                name: "Things",
                value: [
                    ["Food", dawn.next_feed],
                    ["Water", dawn.next_drink],
                    ["Play", dawn.next_play],
                ].map(x => `**${x[0]}** (${calculateRequirementFromDate(new Date(x[1]))}%)\n${makePercentageASCII(calculateRequirementFromDate(new Date(x[1])), 20)
                    }${moreDetails ? `\n(${new Date(x[1]).toLocaleString()})` : ""}`).join("\n")
            },
            {
                name: "Details",
                value: `**Obtained At**: ${dawn.created_at.toDateString()}`
            }
        ])
        .setColor(dawn.hair_color_hex as any);
}

export function getDawnagotchiRequirements(dawn: Dawnagotchi): DawnagotchiRequirements {
    return {
        feed: calculateRequirementFromDate(dawn.next_feed),
        play: calculateRequirementFromDate(dawn.next_play),
        drink: calculateRequirementFromDate(dawn.next_drink),
    };
}

export function calculateRequirementFromDate(expected: Date): number {
    let distance = ((expected.getTime() - Date.now()) / 3.6e+6);
    return Math.min(100, Math.max(0, Math.round(50 + distance)));
}

export async function awardMoneyForCaringForDawn(dawn: Dawnagotchi): Promise<number | null> {
    let eco = await getEconomyFor(dawn.owner_id);

    let moneyAwarded: number | null = null;

    if (config.economy.dawn.limit - (Date.now() - eco.last_dawn_care) < 0) {
        moneyAwarded = randomFromRange(config.economy.dawn.min, config.economy.dawn.max);
        await database.run(`UPDATE economy SET last_dawn_care = ? WHERE user_id = ?`, Date.now(), dawn.owner_id);
        await addMoneyFor(dawn.owner_id, moneyAwarded, "commands");
    }

    return moneyAwarded;
}