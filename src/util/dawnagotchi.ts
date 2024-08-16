import { EmbedBuilder } from "discord.js";
import { createEmbed } from "./other";
import makePercentageASCII from "./percentageMaker";

interface DawnagotchiRequirements {
    feed: number,
    drink: number,
    play: number,
}

export function generateDawnagotchiEmbed(dawn: Dawnagotchi): EmbedBuilder {
    let requirements = getDawnagotchiRequirements(dawn);

    return createEmbed()
        .setTitle(`Dawnagotchi details`)
        .addFields([
            {
                name: "Things",
                value: [
                    ["Food", requirements.feed],
                    ["Water", requirements.drink],
                    ["Play", requirements.play],
                ].map(x => `**${x[0]}** (${x[1]}%)\n${makePercentageASCII(x[1] as number, 20)}`).join("\n")
            },
            {
                name: "Details",
                value: `**Created At**: ${dawn.created_at.toDateString()}`
            }
        ])
        .setColor(dawn.hair_color_hex as any);
}

export function getDawnagotchiRequirements(dawn: Dawnagotchi): DawnagotchiRequirements {
    // If the next date = current date the requirement is half
    // If it is in the future it is >50
    // If it is below it is <50

    return {
        feed: calculateRequirementFromDate(dawn.next_feed),
        play: calculateRequirementFromDate(dawn.next_play),
        drink: calculateRequirementFromDate(dawn.next_drink),
    };
}

export function calculateRequirementFromDate(expected: Date): number {
    let distance = ((expected.getTime() - Date.now()) / 3.6e+6);
    return Math.round(50 + distance);
}