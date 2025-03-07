import TrancerBooleanInput from "../../Components/TrancerBooleanInput";
import TrancerStringInput from "../../Components/TrancerStringInput";
import Column from "../../dawn-ui/components/Column";
import FullWidthInput from "../../dawn-ui/components/FullWidthInput";
import Words from "../../dawn-ui/components/Words";
import { useBotDetails } from "../../hooks/useBotDetails";
import useServerResources from "../../hooks/useServerResources";

export default function AutobanSettings({
  server,
}: {
  server: ReturnType<typeof useServerResources>;
}) {
  const botDetails = useBotDetails();

  return (
    <Column>
      <Words type="heading">Autoban Settings</Words>
      <label>
        Trancer can automagically ban new joiners who have bad usernames/display
        names! When a "mommy" joins your server Trancer will instantly
        annihilate them!
      </label>
      <label>
        Trancer has auto-banned{" "}
        <b>{server.resources.raw_settings.auto_ban_count}</b> members from your
        server!
      </label>

      <FullWidthInput
        name="Autoban Enabled"
        description="Whether or not autoban is enabled. Trancer needs the ban members permission in your server!"
      >
        <TrancerBooleanInput k="auto_ban_enabled" server={server} />
      </FullWidthInput>
      <FullWidthInput
        name="Autoban Keywords"
        description="The keywords to ban from your server. Each one will be checked individually. Seperate words with a semicolon (;), like: mommy;daddy;mistress"
      >
        <TrancerStringInput
          placeholder="mommy;daddy;kink"
          k="auto_ban_keywords"
          server={server}
        />
      </FullWidthInput>
    </Column>
  );
}
