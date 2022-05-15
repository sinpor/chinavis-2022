import {
    AppBar,
    Button,
    Container,
    createTheme,
    ThemeProvider,
    Toolbar,
    Typography,
} from "@mui/material";
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
const theme = createTheme();

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <ThemeProvider theme={theme}>
            <>
                <AppBar position="static" color="default">
                    <Toolbar>
                        <Typography
                            variant="h6"
                            color="inherit"
                            noWrap
                            className=""
                        >
                            冲！
                        </Typography>
                        <div className="flex-1 text-right">
                            <Button>
                                <Link
                                    className="text-inherit focus:text-inherit  no-underline"
                                    to=""
                                >
                                    {"page1"}
                                </Link>
                            </Button>
                            <Button>
                                <Link
                                    className="text-inherit focus:text-inherit  no-underline"
                                    to="/page2"
                                >
                                    {"page2"}
                                </Link>
                            </Button>
                            <Button>
                                <Link
                                    className="text-inherit focus:text-inherit  no-underline"
                                    to="/page3"
                                >
                                    {"page3"}
                                </Link>
                            </Button>
                        </div>
                    </Toolbar>
                </AppBar>
                <Container sx={{ padding: "24px" }}>{children}</Container>
            </>
        </ThemeProvider>
    );
};
