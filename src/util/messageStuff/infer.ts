import { Argument } from "../../types/util";
import { isURL } from "../other";
import { ArgumentCheckerContext } from "./argumentChecker";

export async function checkInfer(
  arg: Argument,
  value: string,
  ctx: ArgumentCheckerContext,
): Promise<string> {
  if (arg.type === "attachment") {
    let ref = ctx.super.message.reference
      ? await ctx.super.message.fetchReference()
      : null;
    let isPfp = value?.toLowerCase() === "pfp";
    let self = ctx.super.message.author.displayAvatarURL({
      size: 2048,
      extension: "png",
    });

    // ref + "pfp" = ref pfp
    // "pfp" = self pfp
    // ref + url = ref url
    // url = url
    // <@user> = user pfp
    // ref + infer + attachment = ref attachment
    // ref + infer = ref pfp
    // attachment = self attachment
    // self pfp

    let preferences = [
      arg.infer !== false && ref !== null && isPfp
        ? ref.author.displayAvatarURL({
            size: 2048,
            extension: "png",
          })
        : null,
      ref === null && isPfp ? self : null,
      ref !== null && isURL(ref.content) ? ref.content : null,
      isURL(value) ? value : null,
      value?.match(/<@[0-9]+>/) ? value /* deal with it later  */ : null,
      arg.infer !== false && ref !== null && ref.attachments.size > 0
        ? ref.attachments.at(0).url
        : null,
      arg.infer !== false && ref !== null
        ? ref.author.displayAvatarURL({
            size: 2048,
            extension: "png",
          })
        : null,
      ctx.super.message.attachments.size > 0
        ? ctx.super.message.attachments.at(0).url
        : null,
      self,
    ];

    return preferences.find((x) => x !== null) || value;
  } else if (
    (arg.infer || (arg.type === "user" && arg.infer !== false)) &&
    ctx.super.message.reference
  ) {
    let reference = await ctx.super.message.fetchReference();

    switch (arg.type) {
      case "string":
        return reference.content;
      case "user":
        return reference.author.id;
    }
  }

  return value;
}
