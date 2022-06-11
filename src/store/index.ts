import { makeAutoObservable } from 'mobx';
import { createContext } from 'react';
import { IForceData, ILinkData, INodeData } from '../types';
import { getIndustry } from '../utils/utils';

class Store {
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    // this.updateSelectedNodes = this.updateSelectedNodes.bind(this);
  }
  initData: any = {};

  currentData: IForceData = {} as IForceData;

  //   选中的节点
  selectedNodes: number[] = [];

  //   当前社区id
  curCommunity = 0;

  communityList: any[] = [];

  highlightNodes: INodeData[] = [];

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

  updateSelectedNodes(nodes: number[]) {
    this.selectedNodes = nodes;
  }

  updateCurCommunity(id: number) {
    this.curCommunity = id;
  }

  updateCommunityList(list: any[]) {
    this.communityList = list;
  }

  updateHighlightNodes(list: INodeData[]) {
    this.highlightNodes = list;
  }
}

export const store = new Store();

export const StoreContext = createContext<Store>(store);
