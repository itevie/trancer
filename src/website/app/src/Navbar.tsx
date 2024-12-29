import Link from "./dawn-ui/components/Link";
import Navbar from "./dawn-ui/components/Navbar";
import Row from "./dawn-ui/components/Row";

export default function AppNavbar({ full }: { full?: boolean }) {
  return (
    <Navbar title="Trancer Bot" breadcrumb noPage={full}>
      <Row>
        <Link href="/servers">Servers</Link>
        <Link href="/economy">Economy</Link>
        <Link href="/user_settings">Your Settings</Link>
      </Row>
    </Navbar>
  );
}
