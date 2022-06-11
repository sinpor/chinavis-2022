import React, { useEffect, useState, useContext } from 'react';
import { Input, Space, Button } from 'antd';
import { AudioOutlined } from '@ant-design/icons';
import { request } from '../../../utils/request/request';
import { httpSearchNode, httpAddNode } from '../../../utils/request/httpRequest';
import { LoginOutlined, SearchOutlined } from '@ant-design/icons';

import { observer } from 'mobx-react';
import { store } from '../../../store';

const { Search } = Input;

export const SearchId: React.FC = observer(() => {
	
	const [nodeUid, setNodeUid] = useState<string>();

	let state = true;
	
	// 搜索节点（按钮）
	const onSearch = () => {
		if (!state) return;
		state = false;
		httpSearchNode({ nodeUid: nodeUid })
			?.then((res) => {
				if (!res.error) {
					// store.initData.error = res.error;
					// store.initData.curCommunity = res.curCommunity;
					store.updateInitData({
						...store.initData,
						curCommunity: res.curCommunity,
						error: res.error,
					});
					store.updateCurrentData({ nodes: res.nodes, links: res.links });
				}
				state = true;
			})
			.then((res) => {
				for (const node of res.nodes) {
					if (node.uid === value) {
						store.updateSelectedNodes([node.uid]);
						break;
					}
				}
			})
			.catch((r) => {
				state = true;
			});
	};
	
	const onAdd = () => {
		if (!state) return;
		state = false;
		httpAddNode({ nodeUid: nodeUid })
			?.then((res) => {
				if (!res.error) {
					// store.initData.error = res.error;
					// store.initData.curCommunity = res.curCommunity;
					store.updateInitData({
						...store.initData,
						error: res.error,
					});
					store.updateCurrentData({ nodes: res.nodes, links: res.links });
				}
				state = true;
			})
			.then((res) => {
				for (const node of res.nodes) {
					if (node.uid === value) {
						store.updateSelectedNodes([node.uid]);
						break;
					}
				}
			})
			.catch((r) => {
				state = true;
			});
	};

	return (
		<Space direction="horizontal" className="w-full">
			<Input placeholder="请输入网络资产线索"
				style={{ width: '100%' }} 
				value={nodeUid}
				onChange={(e) => setNodeUid(e.target.value)}>
			</Input>
			<Button onClick={onSearch} icon={<SearchOutlined />}></Button>
			<Button onClick={onAdd} icon={<LoginOutlined />}></Button>
		</Space>
	);
});
