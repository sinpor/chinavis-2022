import { makeAutoObservable } from 'mobx';
import { createContext } from 'react';
import { INodeData } from '../types';
import { getIndustry } from '../utils/utils';

class Store {
  constructor() {
    makeAutoObservable(this);
  }
  initData: any = {};

  updateInitData(data: any) {
    this.initData = {
      ...data,
      nodes: data.nodes?.map((d: INodeData) => ({ ...d, industry: getIndustry(d.industry as any) })),
    };
  }
}

export const store = new Store();

export const StoreContext = createContext<Store>(store);
