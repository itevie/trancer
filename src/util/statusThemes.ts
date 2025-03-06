const statusThemes: {
  [key: string]: { red: string; green: string; orange: string };
} = {
  circles: {
    red: "🔴",
    orange: "🟠",
    green: "🟢",
  },
  squares: {
    red: "🟥",
    orange: "🟧",
    green: "🟩",
  },
  fruit: {
    red: "🍎",
    orange: "🍊",
    green: "🍏",
  },
  hearts: {
    red: "❤️",
    orange: "🧡",
    green: "💚",
  },
  books: {
    red: "📕",
    orange: "📙",
    green: "📗",
  },
  flowers: {
    red: "🌹",
    orange: "🌻",
    green: "🥬",
  },
} as const;

export default statusThemes;
