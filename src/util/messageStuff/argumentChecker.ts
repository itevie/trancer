import { client } from "../..";
import { parseCommand } from "../../events/messageCreate";
import {
  ArgumentType,
  Argument,
  NumberArgument,
  StringArgument,
  ArrayArgument,
  AttachmentArgument,
  UserArgument,
  CurrencyArgument,
} from "../../types/util";
import { actions } from "../database";
import { currency } from "../language";
import { CommandCheckContext } from "./util";

export interface ArgumentCheckerContext {
  super: CommandCheckContext;
  index: number;
}

export let argumentCheckers: Record<
  ArgumentType,
  (
    argument: Argument,
    value: string,
    context: ArgumentCheckerContext,
  ) => Promise<
    string | { error: string; autocomplete: string[] } | { result: any }
  >
> = {
  // ----- Primitives -----
  number: async (a: NumberArgument, v, _d) => {
    if (isNaN(parseInt(v))) return "Invalid number provided";
    let result = parseInt(v);

    if (a.min && result < a.min) return `The minimum value is: ${a.min}`;
    if (a.max && result > a.max) return `The maximum value is: ${a.max}`;

    return { result };
  },
  wholepositivenumber: async (a: NumberArgument, v, d) => {
    if (isNaN(parseInt(v)) || parseInt(v) % 1 !== 0 || parseInt(v) < 0)
      return "Expected a whole, positive number";
    return argumentCheckers.number(a, v, d);
  },
  boolean: async (_a, v, _d) => {
    let result = {
      true: true,
      t: true,
      yes: true,
      false: false,
      f: false,
      no: false,
    }[v.toLowerCase()];

    if (result === undefined) return "Expected true or false";
    return { result };
  },
  string: async (a: StringArgument, v, d) => {
    let result: string;

    if (a.takeContent && v.split(" ").length === 1)
      result = d.super.args.join(" ");
    else if (a.takeRest) result = d.super.args.slice(d.index).join(" ");
    else result = v;

    return { result };
  },
  array: async (a: ArrayArgument, v, d) => {
    let parts = a.wickStyle
      ? parseCommand(v).args
      : d.super.args.slice(d.index);
    let result: any[] = [];

    for await (const part of parts) {
      const _result = await argumentCheckers[a.inner as ArgumentType](
        { ...a, type: a.inner as ArgumentType },
        part,
        d,
      );

      if (typeof _result === "object" && "result" in _result)
        result.push(_result.result);
      else return _result;
    }

    // This is treated specially
    return { result };
  },
  any: async (_a, v, _d) => {
    return { result: v };
  },
  none: async (_a, _v, _d) => {
    return { result: null };
  },
  date: async (_a, v, _d) => {
    try {
      let date = new Date(v);
      if (!date) return `Invalid date: ${v} (${date})`;
      console.log(date);
      return { result: date };
    } catch (e) {
      return `Invalid date: ${e}`;
    }
  },

  // ----- Special Types -----
  confirm: async (_a, v, _d) => {
    if (v.toLowerCase() !== "confirm") return `Expected "confirm"`;
    return { result: "confirm" };
  },

  // ----- Discord Types -----
  attachment: async (a: AttachmentArgument, v, d) => {
    let result: string;
    if (v.match(/<?@[0-9]+?>?/)) {
      try {
        const user = await client.users.fetch(v.replace(/[<>@]/g, ""));
        result = user.displayAvatarURL({
          size: 2048,
          extension: "png",
        });
      } catch {
        result = v;
      }
    } else {
      result = v;
    }

    return { result };
  },
  user: async (a: UserArgument, v, d) => {
    // Check if it is self
    if (v.toLowerCase() === "me") return { result: d.super.message.author };

    // Check for mention/id
    if (!v.match(/<?@?[0-9]+>?/))
      return "Invalid user format provided! Please provide a mention or ID";

    // Try fetch
    try {
      let result = await client.users.fetch(v.replace(/[<>@]/g, ""));

      if (a.denyBots && result.bot)
        return "A bot cannot be used for this command";
      if (a.mustHaveEco && !(await actions.eco.existsFor(result.id)))
        return "That user does not have economy set up";

      return { result };
    } catch {
      return `Failed to fetch the user: ${v}`;
    }
  },
  channel: async (a, v, d) => {
    if (!v.match(/<?#?[0-9]+>?/))
      return "Invalid channel format provided! Please provide a mention or ID";

    try {
      let result = await d.super.message.guild.channels.fetch(
        v.replace(/[<>#]/g, ""),
      );

      if (result.guild.id !== d.super.message.guild.id)
        return `That channel is not in this server`;

      return { result };
    } catch {
      return `Failed to fetch the channel: ${v}`;
    }
  },
  role: async (_a, _v, _d) => {
    return "no!";
  },

  // ----- Database Types -----
  currency: async (a: CurrencyArgument, v, d) => {
    // Check shortcuts
    v =
      {
        half: Math.round(d.super.economy.balance / 2),
        quarter: Math.round(d.super.economy.balance / 4),
        third: Math.round(d.super.economy.balance / 3),
      }[v.toLowerCase()]?.toString() ?? v;

    // Check for percents
    if (v.endsWith("%")) {
      let percentage = parseInt(v.replace("%", ""));
      if (isNaN(percentage) || percentage < 0 || percentage > 0)
        return `Invalid percentage`;
      v = Math.round((percentage / 100) * d.super.economy.balance).toString();
    }

    // Validate
    if (isNaN(parseInt(v))) return "Invalid number provided";
    if (parseInt(v) % 1 !== 0) return "Currency cannot be a decimal";
    if (!a.allowNegative && parseInt(v) < 0)
      return "Currency cannot be negative";

    let amount = parseInt(v);

    // Check if user has this amount
    if (amount > d.super.economy.balance)
      return `You do not have ${currency(amount)}!`;

    // Check bondaries
    if (a.min && amount < a.min) return `Minimum amount is ${currency(a.min)}`;
    if (a.max && amount > a.max) return `Maximum amount is ${currency(a.max)}`;

    return { result: amount };
  },
  item: async (_a, v, _d) => {
    let result: Item;
    if (v.match(/^([0-9]+)$/)) result = await actions.items.get(parseInt(v));
    else result = await actions.items.getByName(v);

    if (!result)
      return {
        error: "Invalid item ID/name provided",
        autocomplete: (await actions.items.getAll()).map((x) => x.name),
      };

    return { result };
  },
  card: async (_a, v, _d) => {
    let result: Card;
    if (v.match(/^([0-9]+)$/))
      result = await actions.cards.getById(parseInt(v));
    else result = await actions.cards.getByName(v);

    if (!result)
      return {
        error: "Invalid card ID/name provided",
        autocomplete: (await actions.cards.getAll()).map((x) => x.name),
      };

    return { result };
  },
  deck: async (_a, v, _d) => {
    let result: Deck;
    if (v.match(/^([0-9]+)$/))
      result = await actions.cards.decks.getById(parseInt(v));
    else result = await actions.cards.decks.getByName(v);

    if (!result)
      return {
        error: "Invalid deck ID/name provided",
        autocomplete: (await actions.decks.getAll()).map((x) => x.name),
      };

    return { result };
  },
  rank: async (_a, v, d) => {
    let result = await actions.ranks.get(v);

    if (!result) {
      return {
        error: `That rank does not exist, try creating it with ${d.super.settings.prefix}createrank ${v}!`,
        autocomplete: (await actions.ranks.getAll()).map((x) => x.rank_name),
      };
    }

    return { result };
  },
} as const;
