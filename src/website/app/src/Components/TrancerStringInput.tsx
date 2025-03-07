import Column from "../dawn-ui/components/Column";
import useServerResources from "../hooks/useServerResources";

export default function TrancerStringInput({
  server,
  k,
  varstring,
  placeholder,
}: {
  server: ReturnType<typeof useServerResources>;
  k: string;
  varstring?: boolean;
  placeholder?: string;
}) {
  return (
    <Column util={["no-gap"]}>
      <input
        style={{ minWidth: "300px" }}
        value={server.modified[k] ?? server.resources.settings[k] ?? "null"}
        onChange={(e) => server.addModified(k, e.currentTarget.value)}
        type="text"
        placeholder={placeholder}
      ></input>
      {(varstring ?? false) && (
        <small>
          Use {"{mention}"} to mention the user.<br></br>Use {"{username}"} for
          the username.
        </small>
      )}
    </Column>
  );
}
