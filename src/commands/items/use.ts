import { Message, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { itemText } from "../../util/language";

type UseTypeInner = string | string[];

type StringUseType = UseTypeInner;
type ContextAwareStringUseType = {
  self: UseTypeInner;
  someone: UseTypeInner;
};
type HandleUseType = (message: Message<true>) => Promise<void>;
type UseType = StringUseType | ContextAwareStringUseType | HandleUseType;

const types: { [key: string]: UseType } = {
  pacifier: {
    self: [
      "Awww... $u is sucking on their pacifier",
      "Calming down... sucking on your pacifier... :heart:",
      "Sooo calm, paci calming you down down down",
    ],
    someone: [
      "Aww... $u put their pacifier in $o's mouth! :heart:",
      "$o is feeling so, so calm after $u put their pacifier in their mouth! :heart:",
    ],
  },
  pendulum: {
    self: [
      "$u is swinging their pendulum back and fourth infront of themself!",
      "Thoughts slowing as you swing that pendulum in front of yourself...",
    ],
    someone: [
      "$o's thoughts slowing down as $u swings their pendulum...",
      "Watch out $o, $u is looking evil with their pendulum",
    ],
  },
  stick: {
    self: ["$u poked themselves with a stick...?"],
    someone: ["$u poked $o with a stick!"],
  },
} as const;

const command: HypnoCommand<{ item: Item; user?: User }> = {
  name: "use",
  description: "Use an item (some items don't do anything - just a response)",
  type: "economy",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "item",
        type: "item",
        description: "The item to use",
      },
      {
        name: "user",
        type: "user",
        description: "The user to use the item on",
      },
    ],
  },

  handler: async (message, { args }) => {
    if (!types[args.item.name])
      return message.reply(
        `Sorry, but you can't use that item! If you have an idea for how it could work, let me know!`,
      );

    let aquired = await actions.items.aquired.getFor(
      message.author.id,
      args.item.id,
    );
    if (!aquired || aquired.amount === 0) {
      return await message.reply(`You do not have a ${itemText(args.item)}`);
    }

    let type = types[args.item.name];
    let toSend:
      | string
      | string[]
      | ((message: Message<true>) => Promise<void>)
      | null = null;

    if (typeof type === "string" || Array.isArray(type)) {
      toSend = type;
    } else if (typeof type === "object" && !Array.isArray(type)) {
      toSend = args.user ? type.someone : type.self;
    } else {
      toSend = toSend;
    }

    if (toSend === null) return message.reply(`Oops! Something went wrong.`);

    if (typeof toSend === "function") {
      return toSend(message);
    } else {
      let response = (
        Array.isArray(toSend)
          ? toSend[Math.floor(Math.random() * toSend.length)]
          : toSend
      )
        .replace(/\$u/g, `**${message.author.username}**`)
        .replace(/\$o/g, `**${args.user?.username}**`);

      return message.reply(response);
    }
  },
};

export default command;
