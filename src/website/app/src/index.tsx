import ReactDOM from "react-dom/client";
import App from "./App";
import { loadTheme } from "./dawn-ui";
import ContextMenuManager from "./dawn-ui/components/ContextMenuManager";
import AlertManager from "./dawn-ui/components/AlertManager";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LeaderboardPage from "./pages/Leaderboards";
import { AxiosWrapper } from "./dawn-ui/util";
import "./style.css";
import ServerList from "./pages/Servers";
import ServerOptions from "./pages/ServerOptions";
import UserSettings from "./pages/UserSettings";

window.document.body.style.setProperty("--dawn-neutral-base-color", "300");

export const apiUrl =
  localStorage.getItem("api-url") || `https://trancer.dawn.rest/`;
export const axiosClient = new AxiosWrapper();
axiosClient.noReject = true;
axiosClient.showLoader = true;
axiosClient.config.baseURL = apiUrl;
//axiosClient.config.withCredentials = true;
axiosClient.config.headers = {
  Authorization: "gwzhzyplluziqhsuagkw",
};

loadTheme();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/leaderboards",
    element: <LeaderboardPage />,
  },
  {
    path: "/servers",
    element: <ServerList />,
  },
  {
    path: "/servers/:id",
    element: <ServerOptions />,
  },
  {
    path: "/servers/:id/leaderboards",
    element: <LeaderboardPage />,
  },
  {
    path: "/user_settings",
    element: <UserSettings />,
  },
]);

root.render(
  <>
    <ContextMenuManager />
    <AlertManager />
    <RouterProvider router={router} />
  </>
);
