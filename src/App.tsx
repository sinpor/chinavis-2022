import { Provider } from 'mobx-react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout as Layout } from './layout/Layout';
import { Home } from './pages/home';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </HashRouter>
    </Provider>
  );
}

export default App;
