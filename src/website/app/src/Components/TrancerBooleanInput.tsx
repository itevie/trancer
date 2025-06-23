import Column from "../dawn-ui/components/Column";
import useServerResources from "../hooks/useServerResources";

export default function TrancerBooleanInput({
  server,
  k,
}: {
  server: ReturnType<typeof useServerResources>;
  k: string;
}) {
  return (
    <input
      defaultChecked={Boolean(
        server.modified[k] ?? server.resources.settings[k] ?? "false",
      )}
      onChange={(e) =>
        server.addModified(k, e.currentTarget.checked.toString())
      }
      type="checkbox"
    ></input>
  );
}
