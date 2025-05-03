import { randomFromRange } from "./other";

export const units = {
  //millisecond: 1,
  second: 1000,
  minute: 1000 * 60,
  hour: 1000 * 60 * 60,
  day: 1000 * 60 * 60 * 24,
};

export let unitsArray: [string, number][] = [];
for (const i in units) {
  unitsArray.push([i, units[i]]);
  unitsArray = unitsArray.sort((a, b) => b[1] - a[1]);
}

export function msToHowLong(ms: number, limit: number | null = null): string {
  // Cause I'm really funny like that
  if (Math.random() < 0.05) ms = randomFromRange(0, units.day);

  // Compute the units
  let givenUnits: [string, number][] = [];
  for (const unit of unitsArray) {
    if (ms < unit[1]) continue;

    let amount = Math.floor(ms / unit[1]);

    givenUnits.push([unit[0], amount]);
    ms = ms - amount * unit[1];
  }

  // Remove 0 values
  givenUnits = givenUnits.filter((x) => x[1] > 0);

  // Convert it into text
  let textParts: string[] = [];
  let index = 0;

  for (const unit of givenUnits) {
    if (index === limit) break;
    textParts.push(`${unit[1]} ${unit[0]}${unit[1] !== 1 ? "s" : ""}`);
    index++;
  }

  if (textParts.length === 0) return "Now!";

  return textParts.join(", ");
}
