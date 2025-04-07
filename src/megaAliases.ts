const megaAliases: { [key: string]: string } = {
  red: "setstatus red",
  green: "setstatus green",
  yellow: "setstatus yellow",
  orange: "setstatus orange",
  francify: "cflag fr",
  sellfish: "sellall fish",
  sellminerals: "sellall mineral",
  sellmineral: "sellall mineral",
  sellmin: "sellall mineral",
  sellminbutone: "sellall mineral ?but 1",
  sellmineralbutone: "sellall mineral ?but 1",
  sellmineralsbutone: "sellall mineral ?but 1",
  sellfishbutone: "sellall fish ?but 1",
  sfbo: "sellall fish ?but 1",
  smbo: "sellall mineral ?but 1",
  balovertop10: "balover ?top 10",
} as const;

export default megaAliases;
