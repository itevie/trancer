export default function errorText(
  message: string,
  context?: { [key: string]: string | Error },
) {
  return (
    `:x: ${message}` +
    (!context
      ? ""
      : "\n> " +
        Object.entries(context)
          .map(
            (x) =>
              `${x[0].startsWith("_") ? "" : `${x[0]}: `}${x[1] instanceof Error ? `\`${x[1].message}\`` : x[1]}`,
          )
          .join("\n> "))
  );
}
