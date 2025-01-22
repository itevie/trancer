import ecoConfig from "../ecoConfig";

export function currency(amount: number): string {
  return `**${amount}${ecoConfig.currency}**`;
}

export function itemText(
  item: Item,
  amount?: number,
  forceAmount: boolean = false
): string {
  return `**${(amount && amount > 1) || forceAmount ? `${amount} ` : ""}${
    item.emoji ? item.emoji : ""
  }${item.name}${(amount || forceAmount) && amount !== 1 ? "s" : ""}**`;
}
