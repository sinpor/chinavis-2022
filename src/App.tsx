import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout as Layout } from "./layout/Layout";
import { Home } from "./pages/home";

function App() {
    return (
        <HashRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />}></Route>
                    <Route element={<Navigate to="/" />} />
                </Routes>
            </Layout>
        </HashRouter>
    );
}

export default App;
