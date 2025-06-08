import { User } from "discord.js";
import { MaybePromise } from "../../types/util";
import { generateRandomReward, RandomRewardOptions } from "../items/_util";
import { actions, database } from "../../util/database";
import { itemIDMap, itemMap } from "../../util/db-parts/items";
import { percent } from "../../util/other";

export const missionDifficulties = ["easy", "normal", "hard"] as const;
export type MissionDifficulty = (typeof missionDifficulties)[number];

export interface DatabaseMission {
  id: number;
  for: string;
  created_at: string;
  name: string;
  completed: boolean;
  completed_at: string;
  rewards: string;
  old: string | null;
}

export interface Mission {
  /**
   * The descriptor, i.e. what they have to do
   */
  description: string;

  /**
   * How hard this mission is
   */
  difficulty: MissionDifficulty;

  /**
   * The checker to see if it has been done
   */
  check: (m: DatabaseMission) => MaybePromise<number>;

  /**
   * The reward to give, if it is null, the default reward pool will be given.
   */
  reward?: RandomRewardOptions;
}

export const baseRandomRewards: Record<MissionDifficulty, RandomRewardOptions> =
  {
    easy: {
      currency: {
        min: 10,
        max: 10,
      },
    },
    normal: {
      currency: {
        min: 20,
        max: 30,
      },
    },
    hard: {
      currency: {
        min: 40,
        max: 60,
      },
    },
  };

export const missions = {
  "10 coal": {
    description: "Get 10 coal",
    difficulty: "easy",
    check: async (m) => await checkItem(m, "coal", 10),
  },
  "20 fish": {
    description: "Get any 20 fish",
    difficulty: "normal",
    check: async (m) => await checkItemTagged(m, "fish", 20),
  },
  "20 minerals": {
    description: "Get any 20 minerals",
    difficulty: "normal",
    check: async (m) => await checkItemTagged(m, "mineral", 20),
  },
  "2 missions": {
    description: "Complete 2 other missions",
    difficulty: "normal",
    check: async (m) => {
      let n = await actions.eco.getFor(m.for);
      let old = convertMissionOld(m);
      return percent(n.mission_tokens - old.eco.mission_tokens, 2);
    },
  },
} satisfies Record<string, Mission>;
export type MissionName = keyof typeof missions;
export const missionCount = Object.keys(missions).length;

async function checkItem(
  m: DatabaseMission,
  itemName: string,
  amount: number,
): Promise<number> {
  let old = convertMissionOld(m)
    .items.filter((x) => x.item_id === itemMap[itemName].id)
    .reduce((p, c) => p + c.amount, 0);
  let n = (await actions.items.aquired.getFor(m.for, itemMap[itemName].id))
    .amount;

  return percent(n - old, amount);
}

async function checkItemTagged(
  m: DatabaseMission,
  tag: string,
  amount: number,
): Promise<number> {
  let old = convertMissionOld(m)
    .items.filter((x) => itemIDMap[x.item_id].tag === tag)
    .reduce((p, c) => p + c.amount, 0);
  let n = (await actions.items.aquired.getAllFor(m.for))
    .filter((x) => itemIDMap[x.item_id].tag === tag)
    .reduce((p, c) => p + c.amount, 0);

  return percent(n - old, amount);
}

function convertMissionOld(data: DatabaseMission): {
  items: AquiredItem[];
  eco: Economy;
} {
  return JSON.parse(data.old);
}
