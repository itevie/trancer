import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import config from "./config.json";
import { showLoginPrompt } from "./Components/LoginPrompt";

export default function Navbar() {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar sx={{ gap: "10px" }}>
                    <Typography onClick={() => window.location.href = "/"} className="navbar-header" variant="h6" component="div">
                        {config.name}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                        <Button onClick={() => window.location.href = "/spirals"} color="inherit">Spirals</Button>
                    </Box>
                    <Button color="inherit" onClick={() => showLoginPrompt()}>Login</Button>
                </Toolbar>
            </AppBar>
        </Box>
    )
}