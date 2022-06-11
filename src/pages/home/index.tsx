import React, { useEffect } from 'react';
import { Force } from './components/Force';
import { Pie } from './components/Pie';
import { CoreBar } from './components/CoreBar';
import { Controls } from './components/Controls';
import { List } from './components/List';
import { SearchId } from './components/Search';
import { httpInit } from '../../utils/request/httpRequest';
import { store } from '../../store';
import StatisticCommunity from './components/StatisticCommunity';

export const Home: React.FC = () => {
  useEffect(() => {
    httpInit()?.then((res) => {
      store.updateInitData(res);
    });
  }, []);
  return (
    <div className="flex h-full">
      <div className="flex flex-col mr-4  w-300px">
        <div className="bg-white rounded-xl mb-4 p-4">
          <StatisticCommunity />
        </div>
        <div className="bg-white rounded-xl flex flex-col flex-1 p-4">
          <div className="mb-4">
            <SearchId />
          </div>
          <div className="flex-1 ">
            <List />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl flex flex-col flex-1 min-w-700px p-4">
        <div className=" ">
          <Controls />
        </div>
        <div className="flex-1 ">
          <Force />
        </div>
      </div>
      <div className="flex flex-col ml-4  w-1/5">
        <div className="bg-white rounded-xl mb-4 p-4">
          <Pie />
        </div>
        <div className="bg-white rounded-xl  flex-1 p-4">
          <CoreBar />
        </div>
      </div>
    </div>
  );
};
