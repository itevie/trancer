import React from 'react';
import ReactDOM from 'react-dom/client';
import "./style/index.css";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Spirals from './Pages/Spirals';
import Navbar from './Navbar';
import { Box, createTheme, ThemeProvider } from '@mui/material';
import { deepPurple, purple } from '@mui/material/colors';
import LoginPrompt from './Components/LoginPrompt';

const theme = createTheme({
  palette: {
    primary: purple,
    secondary: deepPurple,
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <label></label>
  },
  {
    path: "/spirals",
    element: <Spirals />
  }
]);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Navbar />

      <Box component="main" sx={{ p: 3 }}>
        <RouterProvider router={router}></RouterProvider>
      </Box>

      <LoginPrompt />
    </ThemeProvider>
  </React.StrictMode>
);
