import ecoConfig from "../../ecoConfig";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import {
  createEmbed,
  randomFromRange,
  RandomMinMax,
  randomMinMax,
} from "../../util/other";
import { currency } from "../../util/language";
import { awardRandomThings } from "../items/_util";
import { jobs } from "./_jobs";
import { calculateLevel } from "../../messageHandlers/xp";
import Buttoned from "../../util/components/Buttoned";

// $r = Reward
// $c = Currency Symbol
// $ru = Random username
const responses = [
  "You hypnotised $ru and made $r!",
  "You earnt $r!",
  "You turned into a giraffe and made $r",
  "You turned $ru into a giraffe and made $r!",
  "You helped moderate Trancy Twilight and made $r!",
  "$r",
  "Fine... just have the $r, I guess.",
  "You robbed me and made $r!",
  "You robbed $ru and made $r!",
  "You fell down the stairs and made $r",
  'You found a piece of paper with a $c sign on the back on the floor, you turned it around and it said "Go to John\'s dungeon for free $c"... so you go, you treck all the way there, knocked on the door, and the door opened...\nWhatever would happen next you asked yourself?\nJohn... ||smiled and handed you $r!||',
  "You removed $ru's thoughts and got $r!",
  "You upupup'd $ru and they gave you $r!",
  "You patpatpat'd $ru and they gave you $r!",
  "You helped me give $ru headpats and I gave you $r!",
  "The fish $ru gave you $r.",
  "You hypnotised $ru to give you money (they gave you $r :3)",
  "Haha! I'm not telling you how much you got :3",
  "You comitted awful sins and got $r",
  "You caught an item drop and got $r",
  "You did your taxes and got $r",
  "$ru asked you for some money, but you took it as they were trying to rob you, so you robbed them and stole $r!",
  "You prayed and prayed and prayed... and finally... the Trancer gods gave you your reward... $r",
  "A bird flew over you and dropped $r on your head",
  "You were the victim of the double it and give it to the next person TikTok, but you decided to take it and earnt $r",
  "You sued $ru and got $r",
  "You competed in a competition with $ru and won $r",
  "You were tasked to resist hypnosis... well... you failed but the tist gave you $r out of pity",
  "You gave too much taxes, and the government sent you $r",
  "$ru gave you $r cause why not",
  "You ran the .work command and got $r",
  "You worked at Tesco and got $r",
  "You worked as a cat and got $r",
  "You worked as governmental spy cat and got $r",
  "$c... my precious......... $c.... my....precious..... $r.... my.........precious.......",
  "You exploded and got $r",
  "$c + $c = $r",
  "You did some math problems and got $r",
  "You became a YouTuber and got $r",
  "You made a pizza and got $r",
  "You pat'd Shmurgr on the head, and Flower and Isabella gave you $r",
];

const command: HypnoCommand = {
  name: "work",
  aliases: ["w"],
  description: "Work for money",
  type: "economy",

  ratelimit: ecoConfig.payouts.work.limit,

  preHandler: async (message, { serverSettings, economy }) => {
    if (!economy.job) {
      await Buttoned({
        message,
        options: `You do not have a job! Please pick one in \`${serverSettings.prefix}jobs\``,
        buttons: {
          trash: {
            callback: async (i) => {
              await actions.eco.setJob(message.author.id, "Trash Picker");
              await i.reply(`Set your job to **Trash Picker**!`);
            },
            label: "Select Trash Picker",
          },
        },
      });
      return false;
    }

    return true;
  },

  handler: async (message, { serverSettings, economy }) => {
    const jobName = economy.job as keyof typeof jobs;
    const job = jobs[jobName];

    const reward = await awardRandomThings(message.author.id, job.rewards);
    await actions.eco.addXp(
      message.author.id,
      randomMinMax(((job as any)?.xp as RandomMinMax) || 5),
      "work",
    );

    const members = Array.from(message.guild.members.cache.keys());
    const response = job.phrases[Math.floor(Math.random() * job.phrases.length)]
      .replace(
        /\$ru/g,
        `**${
          message.guild.members.cache.get(
            members[Math.floor(Math.random() * members.length)],
          ).user.username
        }**`,
      )
      .replace(/\$r/g, reward)
      .replace(/\$c/g, ecoConfig.currency);

    return message.reply({
      embeds: [
        createEmbed()
          .setTitle(`You worked as a ${jobName}`)
          .setDescription(response)
          .setFooter({
            text: `You are level ${calculateLevel(economy.work_xp)} in work`,
          }),
      ],
    });
  },
};

export default command;
