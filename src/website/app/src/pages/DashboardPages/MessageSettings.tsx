import TrancerMultiInput from "../../Components/TrancerMultiInput";
import TrancerStringInput from "../../Components/TrancerStringInput";
import Column from "../../dawn-ui/components/Column";
import FullWidthInput from "../../dawn-ui/components/FullWidthInput";
import Words, { TextType } from "../../dawn-ui/components/Words";
import useServerResources from "../../hooks/useServerResources";

export default function MessageSettings({
  server,
}: {
  server: ReturnType<typeof useServerResources>;
}) {
  return (
    <Column>
      <Words type={TextType.Heading}>Welcome/Leave Settings</Words>
      <label>Configure welcome / leave / boost messages here!</label>
      <Words type={TextType.Heading}>Welcome</Words>
      <FullWidthInput
        name="Welcome Channel"
        description="Where welcome messages should be sent"
      >
        <TrancerMultiInput
          k="welcome_channel"
          server={server}
          v={server.resources.channels.map((x) => [x.id, x.name])}
        />
      </FullWidthInput>
      <FullWidthInput
        name="Welcome Message"
        description="What should Trancer say in the welcome channel?"
      >
        <TrancerStringInput
          k="welcome_message"
          server={server}
          varstring={true}
        />
      </FullWidthInput>
      <Words type={TextType.Heading}>Leave</Words>
      <FullWidthInput
        name="Leave Channel"
        description="Where leave messages should be sent"
      >
        <TrancerMultiInput
          k="leave_channel"
          server={server}
          v={server.resources.channels.map((x) => [x.id, x.name])}
        />
      </FullWidthInput>
      <FullWidthInput
        name="Leave Message"
        description="What should Trancer say in the leave channel?"
      >
        <TrancerStringInput
          k="leave_message"
          server={server}
          varstring={true}
        />
      </FullWidthInput>
      <Words type={TextType.Heading}>Boost</Words>
      <FullWidthInput
        name="Boost Channel"
        description="Where boost messages should be sent"
      >
        <TrancerMultiInput
          k="boost_channel"
          server={server}
          v={server.resources.channels.map((x) => [x.id, x.name])}
        />
      </FullWidthInput>
      <FullWidthInput
        name="Boost Message"
        description="What should Trancer say in the boost channel?"
      >
        <TrancerStringInput
          k="boost_message"
          server={server}
          varstring={true}
        />
      </FullWidthInput>
    </Column>
  );
}
