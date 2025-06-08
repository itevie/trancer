import { Message, MessageCreateOptions, User } from "discord.js";
import { actions } from "./database";
import { b } from "./language";
import { Mission, missions } from "../commands/economy/_missions";
import { englishifyRewardDetails } from "../commands/items/_util";
import command from "../commands/xp/xp";

export async function runPreEconomicCommand(message: Message): Promise<void> {
  const today = await actions.missions.fetchTodayFor(message.author.id);
  if (today.length === 0) {
    for (let i = 0; i != 3; i++) {
      await actions.missions.generate(message.author);
    }
  }
}

const resolvers: ((user: User) => Promise<string | null>)[] = [
  async (u) => {
    let missionText = [];
    let userMissions = await actions.missions.fetchTodayFor(u.id);

    for await (const m of userMissions) {
      missionText.push(
        `> ${b(missions[m.name].description)}: ${await (missions[m.name] as Mission).check(m)}%`,
      );
    }
    if (missionText.length === 0) return null;
    return `Your missions:\n` + missionText.join("\n");
  },
];

export async function manipulatePostEconomicCommand(
  result: MessageCreateOptions,
  message: Message,
) {
  let text = "";

  let completed = await actions.missions.checkCompletion(message.author.id);
  if (completed.length > 0) {
    text =
      `You completed a mission! Welldone!\n` +
      completed
        .map(
          (x) =>
            `> ${b(missions[x.name].description)}: ${englishifyRewardDetails(JSON.parse(x.rewards))}`,
        )
        .join("\n");
  }

  if (!text && Math.random() > 0.5) {
    let t = await resolvers[Math.floor(Math.random() * resolvers.length)](
      message.author,
    );
    if (t) text = t;
  }

  if (result.content) {
    result.content += "\n> " + text;
  } else {
    result.content = text;
  }
}
