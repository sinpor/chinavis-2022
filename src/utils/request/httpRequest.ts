import axios from "axios";

import {eventBus} from "../bus/bus";

axios.defaults.baseURL = "http://10.170.47.171:5000/";

const httpRequest = (req, url, params) => {
	// console.log('start');
	switch (req) {
		case "GET":
			axios({
				url: url,
				method: 'GET',
				headers: {},
				params: params,
			}).then(response => {
				// console.log(response.data);
				eventBus.emit(url, response.data);
			});
			break;

		case "POST":
			axios({
				url: url,
				method: 'POST',
				headers: {},
				data: params,
			}).then(response => {
				if (response.data.success) {
					// setTimeout(alert('处理完成！'), 2000);
				}
			});
			break;
	}
};


// 初始化
const httpInit = () => httpRequest('GET', 'init');

// 选择社区
// { communityId }
const httpSelectCommunity = ( param ) => httpRequest('GET', 'selectCommunity', param);

// 搜索节点
// { nodeId }
const httpSearchNode = ( param ) => httpRequest('GET', 'searchNode', param);

// 节点扩张
// { nodeId, nodeLabel }
const httpExpandNode = ( param ) => httpRequest('GET', 'expandNode', param);

// 节点移除
// { nodes: [] }
const httpRemoveNodes = ( param ) => httpRequest('POST', 'removeNodes', param);

// 资产标记
// { nodes: [], isCore: boolean }
const httpSetCore = ( params ) => httpRequest('POST', 'setCore', params);

// 保存视图
// { communityId }
const httpSaveView = ( param ) => httpRequest('GET', 'saveView', param);

// 重置社区
// { communityId }
const httpReset = ( param ) => httpRequest('GET', 'reset', param);

// 全部重置
const httpResetAll = () => httpRequest('GET', 'reset/all');

export {
	httpRequest,
	httpInit,
	httpSelectCommunity,
	httpSearchNode,
	httpExpandNode,
	httpRemoveNodes,
	httpSetCore,
	httpSaveView,
	httpReset,
	httpResetAll
};

// export { httpRequest };
