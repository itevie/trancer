import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import {
  createEmbed,
  makePercentageASCII,
  randomFromRange,
} from "../../util/other";
import { actions, database } from "../../util/database";
import ecoConfig from "../../ecoConfig";
import { BlendMode, Jimp } from "jimp";
import config from "../../config";

const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

interface DawnagotchiRequirements {
  feed: number;
  drink: number;
  play: number;
}

export async function generateDawnagotchiImage(dawn: Dawnagotchi) {
  const oldColor = hexToRgb("#ff00ed");
  const newColor = hexToRgb(dawn.hair_color_hex);

  let image = await Jimp.read(config.dataDirectory + "/dawn/base_dawn.png");
  image.scan(
    0,
    0,
    image.bitmap.width,
    image.bitmap.height,
    function (_, _2, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];

      // Exact match
      if (r === oldColor.r && g === oldColor.g && b === oldColor.b) {
        this.bitmap.data[idx + 0] = newColor.r;
        this.bitmap.data[idx + 1] = newColor.g;
        this.bitmap.data[idx + 2] = newColor.b;
      }
    },
  );

  const overlay = async (file: string) => {
    const o = await Jimp.read(config.dataDirectory + "/dawn/" + file);
    image.composite(o, 0, 0, {
      mode: BlendMode.SRC_OVER,
      opacityDest: 1,
      opacitySource: 1,
    });
  };

  const requirements = getDawnagotchiRequirements(dawn);

  if (requirements.feed < 25) await overlay("acc_food.png");
  if (requirements.drink < 25) await overlay("acc_water.png");
  if (requirements.play < 25) await overlay("acc_play.png");

  return await image.getBuffer("image/png");
}

export async function generateDawnagotchiEmbed(
  dawn: Dawnagotchi,
  moreDetails: boolean = false,
): Promise<{ embed: EmbedBuilder; attachment: AttachmentBuilder }> {
  const buffer = await generateDawnagotchiImage(dawn);
  const attachment = new AttachmentBuilder(buffer, { name: "dawn.png" });

  const embed = createEmbed()
    .setTitle(`Dawnagotchi details`)
    .addFields([
      {
        name: "Things",
        value: [
          ["Food", dawn.next_feed],
          ["Water", dawn.next_drink],
          ["Play", dawn.next_play],
        ]
          .map(
            (x) =>
              `**${x[0]}** (${calculateRequirementFromDate(
                new Date(x[1]),
              )}%)\n${makePercentageASCII(
                calculateRequirementFromDate(new Date(x[1])),
                25,
              )}${moreDetails ? `\n(${new Date(x[1]).toLocaleString()}` : ""}`,
          )
          .join("\n"),
      },
    ])
    .setColor(dawn.hair_color_hex as any)
    .setImage("attachment://dawn.png")
    .setFooter({ text: `Obtained at ${dawn.created_at.toDateString()}` });
  return { embed, attachment };
}

export function getDawnagotchiRequirements(
  dawn: Dawnagotchi,
): DawnagotchiRequirements {
  return {
    feed: calculateRequirementFromDate(dawn.next_feed),
    play: calculateRequirementFromDate(dawn.next_play),
    drink: calculateRequirementFromDate(dawn.next_drink),
  };
}

export function calculateRequirementFromDate(expected: Date): number {
  const hoursUntilExpected = (expected.getTime() - Date.now()) / 3.6e6;
  const percentage = Math.min(
    100,
    Math.max(0, Math.round(50 + (hoursUntilExpected * 50) / 24)),
  );
  return percentage;
}

export async function awardMoneyForCaringForDawn(
  dawn: Dawnagotchi,
): Promise<number | null> {
  let eco = await actions.eco.getFor(dawn.owner_id);

  let moneyAwarded: number | null = null;

  // Check normal dawn
  if (ecoConfig.payouts.dawn.limit - (Date.now() - eco.last_dawn_care) < 0) {
    moneyAwarded = randomFromRange(
      ecoConfig.payouts.dawn.min,
      ecoConfig.payouts.dawn.max,
    );
    await database.run(
      `UPDATE economy SET last_dawn_care = ? WHERE user_id = ?`,
      Date.now(),
      dawn.owner_id,
    );
    await actions.eco.addMoneyFor(dawn.owner_id, moneyAwarded, "commands");
  }

  // Check 100% dawn
  if (
    ecoConfig.payouts.dawn100.limit -
      (Date.now() - eco.last_dawn_care_all_100) <
    0
  ) {
    let requirements = getDawnagotchiRequirements(dawn);
    if (
      requirements.drink === 100 &&
      requirements.feed === 100 &&
      requirements.play === 0
    ) {
      moneyAwarded = randomFromRange(
        ecoConfig.payouts.dawn100.min,
        ecoConfig.payouts.dawn100.max,
      );
      await database.run(
        `UPDATE economy SET last_dawn_care_all_100 = ? WHERE user_id = ?`,
        Date.now(),
        dawn.owner_id,
      );
      await actions.eco.addMoneyFor(dawn.owner_id, moneyAwarded, "commands");
    }
  }

  return moneyAwarded;
}
