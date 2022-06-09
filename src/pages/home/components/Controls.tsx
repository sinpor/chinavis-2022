import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
// import { request } from "../../../utils/request/request";
// import { httpRequest } from "../../../utils/request/httpRequest";

import {
	httpRequest,
	httpInit,
	httpExpandNode,
	httpRemoveNodes,
	httpSetCore,
	httpSaveView,
	httpReset,
	httpResetAll
} from "../../../utils/request/httpRequest";

import { eventBus } from "../../../utils/bus/bus";
import { StoreContext } from "../../../store";
import { observer } from "mobx-react";
import { toJS } from "mobx";

// httpInit();

// 核心资产数据处理
const coreBarData = (nodes, links) => {
	const coreNodes = [];
	const nodeIds = [];
	const series = [
		{ name: 'A', data: [] },
		{ name: 'B', data: [] },
		{ name: 'C', data: [] },
		{ name: 'D', data: [] },
		{ name: 'E', data: [] },
		{ name: 'F', data: [] },
		{ name: 'G', data: [] },
		{ name: 'H', data: [] },
		{ name: 'I', data: [] },
	];

	for (const node of nodes) {
		if (node.isCore) {
			nodeIds.push(node.uid);
			coreNodes.push({ id: node.id, linkNodeIds: [] });
		}
	}

	for (const coreNode of coreNodes) {
		for (const link of links) {
			if (link.endId === coreNode.id && (link.type === 'r_dns_a' || link.type === 'r_cert')) {
				coreNode.linkNodeIds.push(link.startId);
			}
		}
		for (const sery of series) {
			sery.data.push(0);
		}
		for (const linkNodeId of coreNode.linkNodeIds) {
			const node = nodes.find((node) => node.id === linkNodeId);
			const industries = eval(node.industry);
			if (industries) {
				for (const industry of industries) {
					const el = series[industry.charCodeAt() - 'A'.charCodeAt()];
					el.data[el.data.length - 1]++;
				}
			}
		}
	}
	// console.log('更新核心资产', nodes, links);
	return { nodeIds: nodeIds, series: series };
}

export const Controls: React.FC = observer(() => {

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

    const store = useContext(StoreContext)

	const [communityList, setCommunityList] = useState([]);

	const [curCommunity, setCurCommunity] = useState(-1);

	const [selectedNodes, setSelectedNodes] = useState([101]);

	const [nodes, setNodes] = useState([]);

	const [links, setLinks] = useState([]);

	let tempcommunityList;
	let tempcurCommunity;
	let tempselectedNodes;
	let tempnodes;
	let templinks;

	// 初始化数据（回调）
	const initData = (data) => {
		setCommunityList(data.communitiesInfo);
		setCurCommunity(data.curCommunity);
		setNodes(data.nodes);
		setLinks(data.links);

		tempcommunityList = data.communitiesInfo;
		tempcurCommunity = data.curCommunity;
		tempnodes = data.nodes;
		templinks = data.links;
		console.log("initCtrl: ", tempcurCommunity);
	}

	// 搜索节点（回调）
	const searchNodeOrCommunity = (data) => {
		console.log("Ctrl: ", tempcurCommunity);
		// console.log(data);
		if (data && tempcurCommunity !== data.curCommunity) {
			setCurCommunity(data.curCommunity);
			setNodes(data.nodes);
			setLinks(data.links);

			tempcurCommunity = data.curCommunity;
			tempnodes = data.nodes;
			templinks = data.links;
			console.log("newCtrl: ", tempcurCommunity);
			// console.log("社区", tempcurCommunity, tempnodes);
			// setSelectedNodes([]);
		}
	}


	// 更改当前社区
	const changeCurCom = (data) => {
		console.log("ControlData", data);
		setCurCommunity(data);
		tempcurCommunity = data;
	}

	// 扩张节点（按钮)
	const expandNodeBtn = () => {
		if (selectedNodes.length !== 1) {
			alert('请选择单个节点进行扩张');
			return;
		}
		const nodeId = selectedNodes[0];
		const node = nodes.find(node => node.id === nodeId);
		const label = node.label;
		httpExpandNode({ node: nodeId, label: label });
	}

	// 扩张节点（回调）
	const expandNodeData = (data) => {
		if (data.nodes) {
			setNodes(tempnodes.concat(data.nodes));
			setLinks(templinks.concat(data.links));
			tempnodes = tempnodes.concat(data.nodes);
			templinks = templinks.concat(data.links);
			console.log(tempnodes);
		}
		// setSelectedNodes([]);
	}

	// 移除节点（按钮）
	const removeNodesBtn = () => {
		if (!selectedNodes) {
			alert('尚未选择节点！');
			return;
		}
		if (selectedNodes.length > 10) {
			const rpl = confirm('当前选择节点数已超过10个，是否继续？');
			if (!rpl) return;
		}
		const nodeList = [];
		const linklist = [];
		for (const node of nodes) {
			if (!selectedNodes.includes(node.id)) {
				nodeList.push(node);
			}
		}
		for (const link of links) {
			if (!(selectedNodes.includes(link.startId) &&
				selectedNodes.includes(link.endId))) {
				linklist.push(link);
			}
		}
		httpRemoveNodes({ node: selectedNodes })
		setNodes(nodeList);
		setLinks(linklist);
		tempnodes = nodeList;
		templinks = linklist;
		setSelectedNodes([]);
	}

	// 资产标记（按钮）
	const setCoreBtn = () => {
		if (!selectedNodes) {
			alert('尚未选择节点！');
			return;
		}
		if (selectedNodes.length > 10) {
			const rpl = confirm('当前选择节点数已超过10个，是否继续？');
			if (!rpl) return;
		}
		const coreNodes = [];
		for (const nodeId of selectedNodes) {
			const node = nodes.find((node) => node.id === nodeId);
			if (node.isCore === false) {
				node.isCore = true;
				coreNodes.push(nodeId);
			}
		}
		if (!coreNodes) {
			alert('请选择尚未标记的节点！');
			return;
		}
		httpSetCore({ nodes: coreNodes, isCore: true });
		// nodes.push({id:1145141919810});
		setNodes([...nodes]);
		tempnodes = [...nodes];
	};

	// 移除资产标记（按钮）
	const removeCoreBtn = () => {
		if (!selectedNodes) {
			alert('尚未选择节点！');
			return;
		}
		if (selectedNodes.length > 10) {
			const rpl = confirm('当前选择节点数已超过10个，是否继续？');
			if (!rpl) return;
		}
		const coreNodes = [];
		for (const nodeId of selectedNodes) {
			const node = nodes.find((node) => node.id === nodeId);
			if (node.isCore === true) {
				node.isCore = false;
				coreNodes.push(nodeId);
			}
		}
		if (!coreNodes) {
			alert('请选择尚未标记的节点！');
			return;
		}
		httpSetCore({ nodes: coreNodes, isCore: false });
		setNodes([...nodes]);
		tempnodes = [...nodes];
	};

	// 保存视图（按钮）
	const saveViewBtn = () => {
		for (const node of nodes) {
			node.community = curCommunity;
		}
		httpSaveView({ community: curCommunity });
	}

	// 保存视图（回调）
	const saveViewData = (data) => {
		// setCommunityList(data.communitiesInfo);
		// tempcommunityList = data.communitiesInfo;
		console.log(data);
	}

	// 重置社区（按钮）
	const resetCommunityBtn = () => {
		httpReset(curCommunity);
	}

	// 重置社区（回调）
	const resetCommunityData = (data) => {
		setNodes(data.nodes);
		setLinks(data.links);
		tempnodes = data.nodes;
		templinks = data.links;
	};

	// 重置所有数据（按钮）
	const resetAllBtn = () => {
		httpResetAll();
	}

	// 初始化事件绑定
	useEffect(() => {
		eventBus.addListener('init', initData);
		eventBus.addListener('searchNode', searchNodeOrCommunity);
		eventBus.addListener('selectCommunity', searchNodeOrCommunity);
		eventBus.addListener('expandNode', expandNodeData);
		eventBus.addListener('saveView', saveViewData);


		eventBus.addListener('reset', resetCommunityData);
		eventBus.addListener('resetAll', initData);

		return () => {
			eventBus.removeListener('init', initData);
			eventBus.removeListener('searchNode', searchNodeOrCommunity);
			eventBus.removeListener('selectCommunity', searchNodeOrCommunity);
			eventBus.removeListener('expandNode', expandNodeData);
			eventBus.removeListener('saveView', saveViewData);

			eventBus.removeListener('reset', resetCommunityData);
			eventBus.removeListener('resetAll', initData);
		}
	}, []);


	// 数据监听（饼图、柱状图节点属性修改）
	useEffect(() => {
		eventBus.emit('updatePieData', nodes);
		eventBus.emit('updateCoreBarData', coreBarData(nodes, links));
	}, [nodes]);

	// 数据监听（力导向图数据修改
	useEffect(() => {
		eventBus.emit('updateForceData', nodes, links);
	}, [links]);

	// 数据监听（社区列表修改）
	useEffect(() => {
		// console.log('数据更新提交');
		eventBus.emit('updateCommunityList', communityList);
	}, [communityList]);

	useEffect(() => {
		eventBus.emit('updateCurCommunity', curCommunity);
	}, [curCommunity]);

    useEffect(() => {
        setSelectedNodes(toJS(store.selectedNodes));
    }, [store.selectedNodes])


	//			<button onClick={updatePieData} className="border h-30px w-100px">修改pie</button>
	//			<button onClick={updateCoreBarData} className="border h-30px w-100px">修改coreBar</button>
	//			<button onClick={httpRequestTest} className="border h-30px w-100px">http测试</button>
	//			<button onClick={testbutton} className="border h-30px w-100px">测试按钮</button>

	return (
		<div className="flex ">
			<button onClick={expandNodeBtn} className="border h-30px w-100px">节点扩张</button>
			<button onClick={removeNodesBtn} className="border h-30px w-100px">节点移除</button>
			<button onClick={setCoreBtn} className="border h-30px w-100px">资产标记</button>
			<button onClick={removeCoreBtn} className="border h-30px w-100px">资产移除</button>
			<button onClick={saveViewBtn} className="border h-30px w-100px">保存视图</button>
			<button onClick={resetCommunityBtn} className="border h-30px w-100px">重置社区</button>
			<button onClick={resetAllBtn} className="border h-30px w-100px">重置所有数据</button>
		</div>
	);
});
