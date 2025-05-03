import { RandomMinMax } from "../../util/other";
import { RandomRewardOptions } from "../items/_util";

export interface WorkJob {
  levelRequired: number;
  description: string;
  phrases: string[];
  rewards: RandomRewardOptions;
  xp?: RandomMinMax;
}

export const jobs = {
  "Trash Picker": {
    levelRequired: 0,
    description: "A normal person looking the streets for trash",
    phrases: [
      "You picked up trash and got $r!",
      "You scoured the streets for trash and got $r!",
      "You contemplated your life as a trash picker, anyway, here's your $r.",
    ],
    rewards: {
      currency: {
        min: 1,
        max: 20,
      },
      items: {
        pool: {
          dirt: 0.7,
          "common-fish": 0.6,
          stick: 0.5,
          rock: 0.2,
          "lottery-ticket": 0.01,
        },
        count: {
          min: 0,
          max: 2,
        },
      },
    },
  },
  "Factory Worker": {
    levelRequired: 5,
    description: "A factory worker fixing nerd stuff",
    phrases: [
      "You fixed some nerd shit in the factory and got $r!",
      "You created a new kind of gear and the factory manager gave you $r!",
      "You found a revolutionary way to save $c, the manager gave you $r!",
    ],
    rewards: {
      items: {
        pool: {
          rock: 0.9,
          dirt: 0.3,
          "stone-pickaxe": 0.2,
          "emerald-pickaxe": 0.001,
        },
        count: {
          min: 0,
          max: 3,
        },
      },
      currency: {
        min: 5,
        max: 30,
      },
    },
  },
  Worshipper: {
    levelRequired: 25,
    description: "A worshipper for the Trancer gods",
    phrases: ["You prayed to the Trancer gods and they blessed you with $r"],
    rewards: {
      items: {
        pool: {
          gold: 0.5,
          "angle-fish": 0.3,
          diamond: 0.01,
        },
        count: {
          min: 1,
          max: 3,
        },
      },
      currency: {
        min: 10,
        max: 80,
      },
    },
  },
} as const satisfies Record<string, WorkJob>;
