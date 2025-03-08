import { showInfoAlert } from "../dawn-ui/components/AlertManager";
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
        <small
          className="dawn-link underline"
          onClick={() =>
            showInfoAlert(
              <label>
                {"{mention}"} to mention the user.
                <br />
                {"{username}"} to get the user's username.
                <br />
                {"{member_count}"} for the member count of the server.
                <br />
                {
                  "{member_count_ord} member count but in ordinals (1st, 2nd, 3rd...)"
                }
              </label>
            )
          }
        >
          {"{placeholders}"}
        </small>
      )}
    </Column>
  );
}
