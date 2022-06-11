import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
// import { request } from "../../../utils/request/request";

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


export const Controls: React.FC = observer(() => {

	const store = useContext(StoreContext);

	const [communityList, setCommunityList] = useState([]);

	const [curCommunity, setCurCommunity] = useState(-1);

	const [selectedNodes, setSelectedNodes] = useState([10]);

	const [nodes, setNodes] = useState([]);

	const [links, setLinks] = useState([]);

	// 扩张节点（按钮)
	const expandNodeBtn = () => {
		if (selectedNodes.length !== 1) {
			alert('请选择单个节点进行扩张');
			return;
		}
		const nodeId = selectedNodes[0];
		const node = nodes.find(node => node.id === nodeId);
		const label = node.label;
		httpExpandNode({ node: nodeId })?.then(res => {
			if (!res.error) {
				if (res.nodes.length) {
					console.log(res.nodes);
					const nodeList = [...nodes];
					const nodecount = [];
					console.log(nodeList);
					for (const node of nodes) {
						if (node.uid === 'Domain_807a8a1a5282607c2063a5b0365268b25f0f62d61741a3e25244840595f10dc3') {
							console.log("321321", node.id);
						}
						nodecount.push(node.id);
					}
					console.log(nodecount);
					for (const node of res.nodes) {
						if (node.uid === 'Domain_807a8a1a5282607c2063a5b0365268b25f0f62d61741a3e25244840595f10dc3') {
							console.log("77777", node.id);
							console.log(nodecount.indexOf(node.id));
						}
						if (nodecount.indexOf(node.id) === -1) {
							nodeList.push(node);
						}
					}
					const linkList = links.concat(res.links);
					setNodes(nodeList);
					setLinks(linkList);
					store.updateCurrentData({ nodes: nodeList, links: linkList });
				} else {
					alert("相邻节点已全部获取！");
				}
				// setSelectedNodes([]);
			}
		});
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
		const linkList = [];
		for (const node of nodes) {
			if (!selectedNodes.includes(node.id)) {
				nodeList.push(node);
			}
		}
		const temp = selectedNodes[0];
		for (const link of links) {
			if (!(selectedNodes.includes(link.startId) ||
				selectedNodes.includes(link.endId))) {
				linkList.push(link);
			}
		}
		httpRemoveNodes({ nodes: selectedNodes })?.then(res => {
			if (!res.error) {
				setNodes(nodeList);
				setLinks(linkList);
				store.updateSelectedNodes([]);
				store.updateCurrentData({ nodes: nodeList, links: linkList });
			}
		});
	}

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
				nodeIds.push(node.name + '//\n' + node.uid);
				coreNodes.push({ id: node.id, linkNodeIds: [] });
			}
		}

		for (const coreNode of coreNodes) {
			for (const sery of series) {
				sery.data.push(0);
			}
			for (const link of links) {
				if (link.endId === coreNode.id) {
					coreNode.linkNodeIds.push(link.startId);
				}
				if (link.startId === coreNode.id) {
					coreNode.linkNodeIds.push(link.endId);
				}
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
		return { nodeIds: nodeIds, series: series };
	}

	// 变更资产标记状态
	const setCore = (status) => {
		if (!selectedNodes.length) {
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
			if (node.isCore !== status) {
				node.isCore = status;
				coreNodes.push(nodeId);
			}
		}
		if (!coreNodes) {
			alert('请选择尚未标记的节点！');
			return;
		}
		httpSetCore({ nodes: coreNodes, isCore: status })?.then(res => {
			if (!res.error) {
				store.updateCurrentData({
					...store.currentData,
					nodes: [...nodes]
				});
			}
		});
		// nodes.push({id:1145141919810});
		setNodes([...nodes]);
		// setSelectedNodes([]);
	}

	// 资产标记（按钮）
	const addCoreBtn = () => {
		setCore(true);
	};

	// 移除资产标记（按钮）
	const removeCoreBtn = () => {
		setCore(false);
	};

	// 保存视图（按钮）
	const saveViewBtn = () => {
		for (const node of nodes) {
			node.community = curCommunity;
		}
		httpSaveView({ community: curCommunity })?.then(res => {
			if (!res.error) {
				alert('保存成功!');
				store.updateInitData({
					...store.initData,
					communitiesInfo: res.communitiesInfo
				});
			}
		});
	}

	// 重置社区（按钮）
	const resetCommunityBtn = () => {
		httpReset(curCommunity)?.then(res => {
			store.updateInitData({
				...store.initData,
				nodes: res.nodes,
				links: res.links
			});
			store.updateSelectedNodes([]);
		});
	}

	const expandComBtn = () => {
		// selectedNodes
		// 还没写
		console.log('还没写！！！');
	}


	// 重置所有数据（按钮）
	const resetAllBtn = () => {
		httpResetAll().then((res) => {
			store.updateSelectedNodes([]);
			store.updateInitData(res);
		});
	}



	// 数据监听（饼图、柱状图节点属性修改）
	useEffect(() => {
		if (nodes.length) {
			eventBus.emit('updatePieData', nodes);
			eventBus.emit('updateCoreBarData', coreBarData(nodes, links));
		}
	}, [nodes]);

	// 数据监听（社区列表修改）
	useEffect(() => {
		console.log('社区列表数据更新提交');
		eventBus.emit('updateCommunityList', communityList);
	}, [communityList]);

	useEffect(() => {
		eventBus.emit('updateCurCommunity', curCommunity);
	}, [curCommunity]);

	useEffect(() => {
		if (!store.initData.error && store.currentData.nodes) {
			setNodes(store.currentData.nodes);
			setLinks(store.currentData.links);
		}
	}, [store.currentData]);

	useEffect(() => {
		if (!store.initData.error) {
			setCurCommunity(store.initData.curCommunity);
		}
	}, [store.initData.curCommunity]);

	// 监听初始化
	useEffect(() => {
		if (!store.initData.error && store.initData.communitiesInfo) {
			setCommunityList(store.initData.communitiesInfo);
		}
	}, [store.initData.communitiesInfo]);

	// 监听节点选择
	useEffect(() => {
		setSelectedNodes(toJS(store.selectedNodes));
		// setSelectedNodes([11]);
	}, [store.selectedNodes]);


	//			<button onClick={updatePieData} className="border h-30px w-100px">修改pie</button>
	//			<button onClick={updateCoreBarData} className="border h-30px w-100px">修改coreBar</button>
	//			<button onClick={httpRequestTest} className="border h-30px w-100px">http测试</button>
	//			<button onClick={testbutton} className="border h-30px w-100px">测试按钮</button>
	// <input type="text" placeholder="请输入支付金额" value={curCommunity} className="border h-30px w-100px"></input>

	return (
		<div className="flex ">
			<button onClick={expandNodeBtn} className="border h-30px w-80px">节点扩张</button>
			<button onClick={removeNodesBtn} className="border h-30px w-80px">节点移除</button>
			<button onClick={addCoreBtn} className="border h-30px w-80px">资产标记</button>
			<button onClick={removeCoreBtn} className="border h-30px w-80px">资产移除</button>
			<button onClick={saveViewBtn} className="border h-30px w-80px">保存视图</button>
			<button onClick={resetCommunityBtn} className="border h-30px w-80px">重置社区</button>
			<button onClick={expandComBtn} className="border h-30px w-80px">拆分社区</button>
			<button onClick={resetAllBtn} className="border h-30px w-100px">重置所有数据</button>
		</div>
	);
});
