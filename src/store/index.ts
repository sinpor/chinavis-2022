import { makeAutoObservable } from 'mobx';
import { createContext } from 'react';
import { IForceData, ILinkData, INodeData } from '../types';
import { getIndustry } from '../utils/utils';

class Store {
  constructor() {
    makeAutoObservable(this);
  }
  initData: any = {};

  currentData: IForceData = {} as IForceData;

  updateInitData(data: any) {
    this.initData = {
      ...data,
      nodes: data.nodes?.map((d: INodeData) => ({ ...d, industry: getIndustry(d.industry as any) })),
    };

    this.updateCurrentData({ nodes: this.initData.nodes, links: this.initData.links });
  }

  updateCurrentData(data: IForceData) {
    this.currentData = {
      ...data,
      nodes: data.nodes?.map((d: INodeData) => ({ ...d, industry: getIndustry(d.industry as any) })),
    };
  }
}

export const store = new Store();

export const StoreContext = createContext<Store>(store);
