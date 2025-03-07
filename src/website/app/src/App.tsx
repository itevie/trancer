import Page from "./dawn-ui/components/Page";
import Container from "./dawn-ui/components/Container";
import AppNavbar from "./Navbar";

export default function App() {
  return (
    <>
      <AppNavbar />
      <Page>
        <Container title="Welcome to Trancer">
          <p>
            Trancer is a hypnosis-oriented Discord bot with many features such
            as: economy, spirals, trigger usage, and more!
          </p>
        </Container>
      </Page>
    </>
  );
}
