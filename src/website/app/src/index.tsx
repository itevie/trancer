import ReactDOM from "react-dom/client";
import App from "./App";
import { loadTheme } from "./dawn-ui";
import ContextMenuManager from "./dawn-ui/components/ContextMenuManager";
import AlertManager from "./dawn-ui/components/AlertManager";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LeaderboardPage from "./pages/Leaderboards";
import { AxiosWrapper } from "./dawn-ui/util";
import "./style.css";

export const apiUrl = `http://localhost:8080/`;
export const axiosClient = new AxiosWrapper();
axiosClient.noReject = true;
axiosClient.showLoader = true;
axiosClient.config.baseURL = apiUrl;
axiosClient.config.withCredentials = true;
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
]);

root.render(
  <>
    <ContextMenuManager />
    <AlertManager />
    <RouterProvider router={router} />
  </>
);
