import React, { useEffect, useState } from "react";
import { Input, Space } from 'antd';
import { AudioOutlined } from '@ant-design/icons';
import { request } from "../../../utils/request/request";
import { eventBus } from "../../../utils/bus/bus";
import { httpSearchNode } from "../../../utils/request/httpRequest";


const { Search } = Input;



export const SearchId: React.FC = () => {

	const [curCommunity, setCurCommunity] = useState(-1);

	// 搜索节点（按钮）
	const onSearch = (value: string) => {
		httpSearchNode({ nodeUid: value });
		// eventBus.emit("clue", value);
	};

	const updateCurCommunity = (data) => {
		setCurCommunity(data)
	}

	useEffect(() => {
		eventBus.addListener('updateCurCommunity', updateCurCommunity);
		return () => {
			eventBus.removeListener('updateCurCommunity', updateCurCommunity);
		}
	}, []);

	return (
		<Space direction="vertical" className="w-full">
			<Search
				placeholder="请输入网络资产线索"
				onSearch={onSearch}
				style={{ width: "100%" }}
			/>
		</Space>
	)

}