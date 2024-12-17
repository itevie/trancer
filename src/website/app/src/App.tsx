import Page from "./dawn-ui/components/Page";
import Container from "./dawn-ui/components/Container";
import AppNavbar from "./Navbar";
import Button from "./dawn-ui/components/Button";

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
              (window.location.href =
                "https://discord.com/oauth2/authorize?client_id=1257438471664963705&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fauth%2Fdiscord&scope=identify+guilds")
            }
          >
            Login with Discord
          </Button>
        </Container>
      </Page>
    </>
  );
}
