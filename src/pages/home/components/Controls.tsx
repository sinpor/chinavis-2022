import React, { useCallback, useEffect, useRef, useState } from "react";
// import { request } from "../../../utils/request/request";
// import { httpRequest } from "../../../utils/request/httpRequest";

import {
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
} from "../../../utils/request/httpRequest";

import { eventBus } from "../../../utils/bus/bus";


export const Controls: React.FC = () => {

	// Pie数据测试
	// const [pieDataPath, setPieDataPath] = useState("/mock/community_1.json");

	// const updatePieData = () => {
	// 	setPieDataPath(prev => {
	// 		// console.log('执行1111');
	// 		if (prev === "/mock/community_1.json") {
	// 			// console.log('执行a');
	// 			return "/mock/community_23.json";
	// 		} else {
	// 			// console.log('执行b');
	// 			return "/mock/community_1.json";
	// 		}
	// 	});
	// };

	// useEffect(() => {
	// 	request(pieDataPath).then(res => {
	// 		const nodes = res.data.nodes;
	// 		eventBus.emit('updatePieData', nodes);
	// 	});
	// }, [pieDataPath]);

	// useEffect(() => {
	// 	request(pieDataPath).then(res => {
	// 		const nodes = res.data.nodes;
	// 		eventBus.emit('updatePieData', nodes);
	// 	});
	// }, []);


	// CoreBar数据测试
	// const [coreBarDataPath, setCoreBarDataPath] = useState("/mock/core_industry.json");

	// const updateCoreBarData = () => {
	// 	setCoreBarDataPath(prev => {
	// 		// console.log('执行1111');
	// 		if (prev === "/mock/core_industry.json") {
	// 			// console.log('执行a');
	// 			return "/mock/core_industry2.json";
	// 		} else {
	// 			// console.log('执行b');
	// 			return "/mock/core_industry.json";
	// 		}
	// 	});
	// };

	// useEffect(() => {
	// 	request(coreBarDataPath).then(res => {
	// 		eventBus.emit('updateCoreBarData', res.data);
	// 	});
	// }, [coreBarDataPath]);

	// useEffect(() => {
	// 	request(coreBarDataPath).then(res => {
	// 		eventBus.emit('updateCoreBarData', res.data);
	// 	});
	// }, []);


	// web连接测试
	// const [data, setData] = useState({});

	// const method = 'GET';
	// const url = 'selectCommunity';
	// const param = { 'community': 2 };

	// const res = (data) => {
	// 	console.log(data);
	// 	setData(data);
	// }

	// const httpRequestTest = () => {
	// 	http.httpRequest(method, url, param);
	// }

	// useEffect(() => {
	// 	eventBus.addListener(url, res);
	// 	return () => {
	// 		eventBus.removeListener(url, res);
	// 	}
	// }, []);




	// 正式内容

	const [communityList, setCommunityList] = useState([]);

	const [curCommunity, setCurCommunity] = useState(1);

	const [selectedNodes, setSelectedNodes] = useState([101]);

	const [nodes, setNodes] = useState([[]]);

	const [links, setLinks] = useState([[]]);

	// const [test, setTest] = useState([[]]);


	// 初始化数据（回调）
	const initData = (data) => {
		// console.log("初始化事件绑定回调");
		setCommunityList(data.communitiesInfo);
		setCurCommunity(data.curCommunity);
		setNodes([data.nodes]);
		setLinks([data.links]);
		// console.log(data.nodes);
	}

	// 扩张节点（按钮)
	const expandNodeBtn = () => {
		if (selectedNodes.length !== 1) {
			alert('请选择单个节点进行扩张');
			return;
		}
		const nodeId = selectedNodes[0];
		const label = () => {
			for (const node of nodes[0]) {
				if (node.id === nodeId) {
					return node.label;
				}
			}
		}
		httpExpandNode({ node: nodeId, label: label });
	}

	// 扩张节点（回调）
	const expandNodeData = (data) => {
		setNodes([nodes[0].concat(data.nodes)]);
		setLinks([links[0].concat(data.links)]);
		setSelectedNodes([]);
	}

	// 移除节点（按钮）
	const removeNodesBtn = () => {
		const nodeList = [];
		const linklist = [];
		if (!selectedNodes) {
			return;
		}
		for (const node of nodes[0]) {
			if (!selectedNodes.includes(node.id)) {
				nodeList.push(node)
			}
		}
		for (const link of links[0]) {
			if (!(selectedNodes.includes(link.startId) &&
				selectedNodes.includes(link.endId))) {
				linklist
			}
		}
		httpRemoveNodes({ node: selectedNodes })
		setNodes(nodeList);
		setLinks(linklist);
		setSelectedNodes([]);
	}

	// 资产标记
	const setCoreBtn = () => {
		const coreNodes = [];
		for (const nodeId of selectedNodes) {
			const node = nodes[0].find((node) => node.id === nodeId);
			if ((node.label === 'IP' || node.label === 'Cert') &&
				node.isCore === false) {
				node.isCore = true;
				coreNodes.push(nodeId);
			}
		}
		httpSetCore({ nodes: coreNodes, isCore: true });
		// nodes.push({id:1145141919810});
		setNodes([nodes[0]]);
	};

	// 移除资产标记
	const removeCoreBtn = () => {
		const coreNodes = [];
		for (const nodeId of selectedNodes) {
			const node = nodes[0].find((node) => node.id === nodeId);
			if ((node.label === 'IP' || node.label === 'Cert') &&
				node.isCore === true) {
				node.isCore = false;
				coreNodes.push(nodeId);
			}
		}
		httpSetCore({ nodes: coreNodes, isCore: false });
		setNodes([nodes[0]]);
	};

	// 保存视图
	const saveViewBtn = () => {
		for (const node of nodes[0]) {
			// TODO: 修改node
		}
		httpSaveView({ communityId: curCommunity });
	}

	// const testbutton = () => {
	// 	console.log(test);
	// 	setTest([test[0]]);
	// }

	// useEffect(() => {
	// 	console.log("1145141919810");
	// }, [test]);


	const resetData = () => { };

	// 初始化事件绑定
	useEffect(() => {
		eventBus.addListener('init', initData);
		eventBus.addListener('expandNode', expandNodeData);
		eventBus.addListener('reset', resetData);
		return () => {
			eventBus.removeListener('init', initData);
			eventBus.removeListener('expandNode', expandNodeData);
			eventBus.removeListener('reset', resetData);
		}
	}, []);

	// 数据监听
	useEffect(() => {
		// console.log("数据监听");
		eventBus.emit('updatePieData', nodes[0]);
		eventBus.emit('updateCoreBarData', nodes[0], links[0]);
	}, [nodes]);

	useEffect(() => {
		// console.log("数据监听");
		eventBus.emit('updateForceData', nodes[0], links[0]);
	}, [links]);

	useEffect(() => {
		eventBus.emit('updateCommunityList', communityList);
	}, [communityList]);

	useEffect(() => {
		httpInit();
	}, []);

	//			<button onClick={updatePieData} className="w-100px border h-30px">修改pie</button>
	//			<button onClick={updateCoreBarData} className="w-100px border h-30px">修改coreBar</button>
	//			<button onClick={httpRequestTest} className="w-100px border h-30px">http测试</button>
	//			<button onClick={testbutton} className="w-100px border h-30px">测试按钮</button>

	return (
		<div className="flex h-50px">

			<button onClick={expandNodeBtn} className="w-100px border h-30px">节点扩张</button>
			<button onClick={removeNodesBtn} className="w-100px border h-30px">节点移除</button>
			<button onClick={setCoreBtn} className="w-100px border h-30px">资产标记</button>
			<button onClick={removeCoreBtn} className="w-100px border h-30px">资产移除</button>
			<button onClick={saveViewBtn} className="w-100px border h-30px">保存视图</button>
		</div>
	);
};
