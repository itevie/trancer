import TrancerBooleanInput from "../../Components/TrancerBooleanInput";
import TrancerMultiInput from "../../Components/TrancerMultiInput";
import TrancerStringInput from "../../Components/TrancerStringInput";
import Column from "../../dawn-ui/components/Column";
import FullWidthInput from "../../dawn-ui/components/FullWidthInput";
import Words from "../../dawn-ui/components/Words";
import { useBotDetails } from "../../hooks/useBotDetails";
import useServerResources from "../../hooks/useServerResources";

export default function BasicSettings({
  server,
}: {
  server: ReturnType<typeof useServerResources>;
}) {
  const botDetails = useBotDetails();

  return (
    <Column>
      <Words type="heading">Basic Settings</Words>
      <label>
        Here you can configure some of the most basic settings for Trancer!
      </label>
      <Words type="heading">Prefix</Words>
      <FullWidthInput
        name="Prefix"
        description="What should Trancer's command prefix be?"
      >
        <TrancerStringInput k="prefix" server={server} />
      </FullWidthInput>
      <FullWidthInput
        name="Analytics"
        description="Should Trancer track analytics for your server? Like messages overtime, most frequently used words? (This is not viewed by the bot owner, it's simply for your own fun)"
      >
        <TrancerStringInput k="analytics" server={server} />
      </FullWidthInput>
      <Words type="heading">Channels</Words>
      <label>Define some simple channels for Trancer to use!</label>
      <FullWidthInput
        name="Invite Logger Channel"
        description="This is where Trancer will post details about new member's invite."
      >
        <TrancerMultiInput
          k="invite_log_channel"
          server={server}
          v={server.resources.channels.map((x) => [x.id, x.name])}
        />
      </FullWidthInput>
      <FullWidthInput
        name="Quote Channel"
        description="Where should Trancer send quotes when you .q them?"
      >
        <TrancerMultiInput
          k="quotes_channel"
          server={server}
          v={server.resources.channels.map((x) => [x.id, x.name])}
        />
      </FullWidthInput>
      <FullWidthInput
        name="Confessions Channel"
        description="Where should confessions made with the confession command be sent?"
      >
        <TrancerMultiInput
          k="confessions_channel"
          server={server}
          nullable={true}
          v={server.resources.channels.map((x) => [x.id, x.name])}
        />
      </FullWidthInput>
      <Words type="heading">Bumping</Words>
      <label>
        You don't need another bot to remind for bumps! Use Trancer!
      </label>
      <FullWidthInput
        name="Remind Bumps"
        description="Whether or not Trancer should ping remind the last bumper"
      >
        <TrancerBooleanInput k="remind_bumps" server={server} />
      </FullWidthInput>
      <FullWidthInput
        name="Bump Channel"
        description="Where should Trancer remind people to bump?"
      >
        <TrancerMultiInput
          k="bump_channel"
          server={server}
          v={server.resources.channels.map((x) => [x.id, x.name])}
        />
      </FullWidthInput>
      <Words type="heading">Customisation</Words>
      <label>Change some little things about Trancer</label>
      <FullWidthInput
        name="Traffic Light Theme"
        description="Change the emojis used for .setstatus!"
      >
        <TrancerMultiInput
          k="status_theme"
          server={server}
          v={botDetails.status_themes.map((x) => [x, x])}
          nullable={false}
        />
      </FullWidthInput>
      <Words type="heading">Hypnosis Roles</Words>
      <label>These are used for the .roles command</label>
      <FullWidthInput name="Tist Role">
        <TrancerMultiInput
          k="tist_role"
          server={server}
          v={server.resources.roles.map((x) => [x.id, x.name])}
        />
      </FullWidthInput>
      <FullWidthInput name="Sub Role">
        <TrancerMultiInput
          k="sub_role"
          server={server}
          v={server.resources.roles.map((x) => [x.id, x.name])}
        />
      </FullWidthInput>
      <FullWidthInput name="Switch Role">
        <TrancerMultiInput
          k="switch_role"
          server={server}
          v={server.resources.roles.map((x) => [x.id, x.name])}
        />
      </FullWidthInput>
    </Column>
  );
}
