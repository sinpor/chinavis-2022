// import request from "request";

// import { eventBus } from '../bus/bus';
import { ILinkData, INodeData } from '../../types';
import { request } from './request';

// axios.defaults.baseURL = "http://10.170.47.171:5000/";

const httpRequest = (req, url, params) => {
  console.log('start');
  switch (req) {
    case 'GET':
      return request({
        url: url,
        method: 'GET',
        headers: {},
        params: params,
      })
        .then((response) => {
          console.log('GET操作完成');
          // console.log(response.data);
          // eventBus.emit(url, response.data);
          return response.data;
        })
        .catch((err) => {
          console.log(err.message);
          return Promise.reject(err);
        });
      break;

    case 'POST':
      return request({
        url: url,
        method: 'POST',
        headers: {},
        data: params,
      })
        .then((response) => {
          console.log('POST操作完成');
          // if (response.data.success) {
          // 	setTimeout(alert('处理完成！'), 2000);
          // }
          return response;
        })
        .catch((error) => {
          console.log(error);
          return Promise.reject(error);
        });
      break;
  }
};

// 初始化
const httpInit = () => httpRequest('GET', 'init');

// 搜索节点
// { nodeId }
const httpSearchNode = (param) => httpRequest('GET', 'searchNode', param);

// 扩增节点
// { nodeId }
const httpAddNode = (param) => httpRequest('GET', 'addNode', param);

// 选择社区
// { communityId }
const httpSelectCommunity = (param) => httpRequest('GET', 'selectCommunity', param);

// 节点扩张
// { nodeId, nodeLabel }
const httpExpandNode = (param) => httpRequest('GET', 'expandNode', param);

// 节点移除
// { nodes: [] }
const httpRemoveNodes = (param) => httpRequest('POST', 'removeNodes', param);

// 资产标记
// { nodes: [], isCore: boolean }
const httpSetCore = (params) => httpRequest('POST', 'setCore', params);

// 保存视图
const httpSaveView = () => httpRequest('GET', 'saveView');

// 重置社区
// { communityId }
const httpReset = (param) => httpRequest('GET', 'reset', param);

// 全部重置
const httpResetAll = () => httpRequest('GET', 'reset/all');

export function findShortestPath(params: { node1Uid: string; node2Uid: string }) {
  return request.get<{ nodes: INodeData[]; links: ILinkData[] }>('findShortestPath', { params });
}

export {
  httpRequest,
  httpInit,
  httpSelectCommunity,
  httpSearchNode,
  httpAddNode,
  httpExpandNode,
  httpRemoveNodes,
  httpSetCore,
  httpSaveView,
  httpReset,
  httpResetAll,
};

// export { httpRequest };
