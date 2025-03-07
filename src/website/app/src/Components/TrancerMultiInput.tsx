import useServerResources from "../hooks/useServerResources";

export default function TrancerMultiInput({
  server,
  k,
  v,
  nullable,
}: {
  server: ReturnType<typeof useServerResources>;
  k: string;
  v: [string, string][];
  nullable?: boolean;
}) {
  return (
    <select
      value={server.modified[k] ?? server.resources.settings[k] ?? "null"}
      onChange={(e) => server.addModified(k, e.currentTarget.value)}
    >
      {(nullable ?? true) && <option value={"%%%null"}>Off</option>}
      {v.map((channel) => (
        <option value={channel[0]}>{channel[1]}</option>
      ))}
    </select>
  );
}
