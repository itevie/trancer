import useServerResources from "../hooks/useServerResources";

export default function TrancerMultiInputFlexible({
  server,
  onChange,
  v,
  value,
  nullable,
}: {
  server: ReturnType<typeof useServerResources>;
  onChange?: (newValue: string) => any;
  value: string;
  v: [string, string][];
  nullable?: boolean;
}) {
  return (
    <select
      value={value ?? "null"}
      onChange={(e) => onChange?.(e.currentTarget.value)}
    >
      {(nullable ?? true) && <option value={"%%%null"}>Off</option>}
      {v.map((channel) => (
        <option value={channel[0]}>{channel[1]}</option>
      ))}
    </select>
  );
}
