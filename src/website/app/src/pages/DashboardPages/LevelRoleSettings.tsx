import { useState } from "react";
import TrancerMultiInputFlexible from "../../Components/TrancerMultiInputFlexible";
import Column from "../../dawn-ui/components/Column";
import FAB from "../../dawn-ui/components/FAB";
import FullWidthInput from "../../dawn-ui/components/FullWidthInput";
import Words, { TextType } from "../../dawn-ui/components/Words";
import useServerResources, { LevelRole } from "../../hooks/useServerResources";
import {
  showErrorAlert,
  showInputAlert,
} from "../../dawn-ui/components/AlertManager";
import GoogleMatieralIcon from "../../dawn-ui/components/GoogleMaterialIcon";
import Row from "../../dawn-ui/components/Row";

export default function LevelRoleSettings({
  server,
}: {
  server: ReturnType<typeof useServerResources>;
}) {
  const [levelRoles, setLevelRoles] = useState<LevelRole[]>(
    server.modified.level_roles
      ? JSON.parse(server.modified.level_roles)
      : server.resources.level_roles || [],
  );

  async function addNew() {
    const level = await showInputAlert("Enter the level");
    if (!level) return;

    if (levelRoles.some((x) => x.level === parseInt(level)))
      return showErrorAlert("You already have a level role with that number!");

    setLevelRoles((old) => {
      let newData = [
        ...old,
        {
          server_id: "",
          level: parseInt(level),
          role_id: null,
        },
      ];

      server.addModified("level_roles", JSON.stringify(newData));

      return newData;
    });
  }

  function change(index: number, newRoleId: string) {
    setLevelRoles((old) => {
      let newData = [...old];
      newData[index].role_id = newRoleId;

      server.addModified("level_roles", JSON.stringify(newData));

      return [...newData];
    });
  }

  function remove(index: number) {
    setLevelRoles((old) => {
      let newData = [...old];
      newData.splice(index, 1);

      server.addModified("level_roles", JSON.stringify(newData));

      return [...newData];
    });
  }

  return (
    <Column>
      <FAB position="left" clicked={addNew} />
      <Words type={TextType.Heading}>Level Roles</Words>
      <label>
        Welcome to level roles! Level roles are a simple way to reward your
        community - the higher they level up, the better roles they get!
        <br />
        To create new levelled roles, simply click that little "+" button on the
        bottom left!
      </label>
      <Words type={TextType.Heading}>The Roles</Words>
      {levelRoles
        .sort((a, b) => a.level - b.level)
        .map((x, i) => (
          <FullWidthInput name={`Level ${x.level}`}>
            <TrancerMultiInputFlexible
              value={x.role_id ?? "null"}
              server={server}
              onChange={(x) => change(i, x)}
              v={server.resources.roles.map((x) => [x.id, x.name])}
            />
            <GoogleMatieralIcon
              onClick={() => {
                remove(i);
              }}
              className="clickable"
              name="delete"
            />
          </FullWidthInput>
        ))}
    </Column>
  );
}
