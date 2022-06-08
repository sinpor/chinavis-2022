import React, { useEffect } from 'react';
import { Force } from './components/Force';
import { Pie } from './components/Pie';
import { CoreBar } from './components/CoreBar';
import { Controls } from './components/Controls';
import { List } from './components/List';
import { SearchId } from './components/Search';
import { httpInit } from '../../utils/request/httpRequest';
import { store } from '../../store';

export const Home: React.FC = () => {
  useEffect(() => {
    httpInit()?.then((res) => {
      store.updateInitData(res);
    });
  }, []);
  return (
    <div className="flex h-full">
      <div className="border mx-2 w-1/6">
        <div className="border m-2">
          <SearchId />
        </div>
        <div className="border m-2">
          <List />
        </div>
      </div>
      <div className="border flex-1 mx-2">
        <div className="border m-2">
          <Controls />
        </div>
        <div className="border m-2">
          <Force />
        </div>
      </div>
      <div className="border mx-2 w-1/5">
        <div className="border m-2">
          <Pie />
        </div>
        <div className="border m-2">
          <CoreBar />
        </div>
      </div>
    </div>
  );
};
