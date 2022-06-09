import { Provider } from 'mobx-react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout as Layout } from './layout/Layout';
import { Home } from './pages/home';
import { store, StoreContext } from './store';

function App() {
  return (
    <Provider store={store}>
      <StoreContext.Provider value={store}>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />}></Route>
              <Route element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </HashRouter>
      </StoreContext.Provider>
    </Provider>
  );
}

export default App;
