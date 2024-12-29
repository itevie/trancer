import Page from "./dawn-ui/components/Page";
import Container from "./dawn-ui/components/Container";
import AppNavbar from "./Navbar";
import Button from "./dawn-ui/components/Button";
import { apiUrl } from ".";

export default function App() {
  return (
    <>
      <AppNavbar />
      <Page>
        <Container>
          <p>Welcome to Trancer - the hypnosis-oriented Discord bot!</p>
          <Button
            className="login-with-discord"
            big
            onClick={() =>
              (window.location.href = `https://discord.com/oauth2/authorize?client_id=1257438471664963705&response_type=code&redirect_uri=${apiUrl}login/callback&scope=identify+guilds`)
            }
          >
            Login with Discord
          </Button>
        </Container>
      </Page>
    </>
  );
}
