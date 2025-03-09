import { ActivityType } from "discord.js";
import { client, commands } from "..";

const statuses: [ActivityType | null, string][] = [
  [0, "type .help for help"],
  [0, "with your mind"],
  [0, "join my server with .inivte"],
  [0, "with spirals"],
  [0, "with pendulums"],
  [0, "*patpat if green*"],
  [0, "Among Us"],
  [0, ".hypnoroulette"],
  [0, "with my Dawnagotchi"],
  [0, "checkout .$cmd"],
  [0, "I'm Trancer!"],
  [ActivityType.Watching, "you"],
  [ActivityType.Watching, "you sleep"],
  [ActivityType.Watching, "for people to .autoban"],
];

export function initStatusChanger() {
  setInterval(changeStatus, 1000 * 60 * 10);
  changeStatus();
}

export async function changeStatus() {
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  await client.user.setActivity({
    type: status[0] === 0 ? ActivityType.Playing : status[0],
    name: status[1].replace(
      /\$cmd/,
      Object.values(commands)[
        Math.floor(Math.random() * Object.values(commands).length)
      ].name
    ),
  });
}
