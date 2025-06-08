import { User } from "discord.js";
import { MaybePromise } from "../../types/util";
import { generateRandomReward, RandomRewardOptions } from "../items/_util";
import { actions, database } from "../../util/database";
import { itemIDMap, itemMap } from "../../util/db-parts/items";
import { percent } from "../../util/other";
import config from "../../config";

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

const baseCurrency = 30;
export const baseRandomRewards: Record<MissionDifficulty, RandomRewardOptions> =
  {
    easy: {
      currency: {
        min: baseCurrency,
        max: baseCurrency,
      },
    },
    normal: {
      currency: {
        min: baseCurrency * 2,
        max: baseCurrency * 2.5,
      },
    },
    hard: {
      currency: {
        min: baseCurrency * 3,
        max: baseCurrency * 4,
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
  "win tictactoe": {
    description: "Win a game of tic-tac-toe",
    difficulty: "hard",
    check: async (m) => {
      let n = await actions.userData.getCollective(m.for);
      let old = convertMissionOld(m);
      return n.ttt_win > old.userData.ttt_win ? 100 : 0;
    },
  },
  "twilight 30 messages": {
    description: "Get 30 messages in Trancy Twilight",
    difficulty: "hard",
    check: async (m) => {
      let n = await actions.userData.getFor(m.for, config.botServer.id);
      return percent(
        n.messages_sent - convertMissionOld(m).botServerUserData.messages_sent,
        50,
      );
    },
  },
  "twilight 50 xp": {
    description: "Get 50 XP in Trancy Twilight",
    difficulty: "hard",
    check: async (m) => {
      let n = await actions.userData.getFor(m.for, config.botServer.id);
      return percent(n.xp - convertMissionOld(m).botServerUserData.xp, 50);
    },
  },
  "twilight bump": {
    description: "Bump Trancy Twilight",
    difficulty: "hard",
    check: async (m) => {
      let n = await actions.userData.getFor(m.for, config.botServer.id);
      return percent(
        n.bumps - convertMissionOld(m).botServerUserData.bumps,
        50,
      );
    },
  },
  "get a card": {
    description: "Obtain 1 card",
    difficulty: "easy",
    check: async (m) => {
      let n = (await actions.cards.aquired.getAllFor(m.for)).reduce(
        (p, c) => p + c.amount,
        0,
      );
      let o = convertMissionOld(m).cards.reduce((p, c) => p + c.amount, 0);
      return n > o ? 100 : 0;
    },
  },
  "get 3 card": {
    description: "Obtain 3 cards",
    difficulty: "hard",
    check: async (m) => {
      let n = (await actions.cards.aquired.getAllFor(m.for)).reduce(
        (p, c) => p + c.amount,
        0,
      );
      let o = convertMissionOld(m).cards.reduce((p, c) => p + c.amount, 0);
      return percent(n - o, 3);
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
  userData: Partial<UserData>;
  botServerUserData: UserData;
  cards: AquiredCard[];
} {
  return JSON.parse(data.old);
}
