import { User } from "discord.js";
import {
  DatabaseMission,
  missions,
  missionCount,
  baseRandomRewards,
  MissionDifficulty,
  Mission,
} from "../../commands/economy/_missions";
import {
  generateRandomReward,
  giveRewardDeteils,
} from "../../commands/items/_util";
import { actions, database } from "../database";
import { itemMap } from "./items";

const _actions = {
  async generate(user: User): Promise<DatabaseMission> {
    let current = await _actions.fetchTodayFor(user.id);
    let missionName: string;
    do {
      missionName = missionName =
        Object.keys(missions)[Math.floor(Math.random() * missionCount)];
    } while (current.some((x) => x.name === missionName));

    const missionData: Partial<DatabaseMission> = {
      for: user.id,
      created_at: new Date().toISOString().split("T")[0],
      name: missionName,
      completed: false,
      completed_at: null,
      rewards: JSON.stringify(
        await generateRandomReward(
          missions[missionName].reward ??
            baseRandomRewards[missions[missionName].difficulty],
        ),
      ),
      old: JSON.stringify({
        items: await actions.items.aquired.getAllFor(user.id),
        eco: await actions.eco.getFor(user.id),
        userData: await actions.userData.getCollective(user.id),
      }),
    };
    return await database.get<DatabaseMission>(
      "INSERT INTO missions (for, created_at, name, rewards, old) VALUES (?, ?, ?, ?, ?) RETURNING *",
      missionData.for,
      missionData.created_at,
      missionData.name,
      missionData.rewards,
      missionData.old,
    );
  },

  async fetchTodayFor(userId: string): Promise<DatabaseMission[]> {
    return await database.all<DatabaseMission[]>(
      "SELECT * FROM missions WHERE for = ? AND created_at = ? AND completed = false",
      userId,
      new Date().toISOString().split("T")[0],
    );
  },

  async setCompleted(missionId: number): Promise<void> {
    await database.run(
      "UPDATE missions SET old = null, completed = true, completed_at = ? WHERE id = ?",
      new Date().toISOString(),
      missionId,
    );
  },

  async checkCompletion(userId: string): Promise<DatabaseMission[]> {
    let userMissions = await _actions.fetchTodayFor(userId);
    let completed: DatabaseMission[] = [];

    for await (const _mission of userMissions) {
      const mission = missions[_mission.name] as Mission;
      if ((await mission.check(_mission)) === 100) {
        completed.push(_mission);
        await actions.eco.addMissionTokenFor(userId);
        await giveRewardDeteils(userId, JSON.parse(_mission.rewards));
        await _actions.setCompleted(_mission.id);
      }
    }

    return completed;
  },
} as const;

export default _actions;
