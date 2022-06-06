import React, { useCallback, useEffect, useRef, useState } from "react";
import { request } from "../../../utils/request/request";
import { eventBus } from "../../../utils/bus/bus";
import * as d3 from "d3";

export const Controls: React.FC = () => {

	// Pie数据测试
	const [pieDataPath, setPieDataPath] = useState("/mock/community_1.json");

	const updatePieData = () => {
		setPieDataPath(prev => {
			// console.log('执行1111');
			if (prev === "/mock/community_1.json") {
				// console.log('执行a');
				return "/mock/community_23.json";
			} else {
				// console.log('执行b');
				return "/mock/community_1.json";
			}
		});
	};

	useEffect(() => {
		request(pieDataPath).then(res => {
			const nodes = res.data.nodes;
			eventBus.emit('updatePieData', nodes);
		});
	}, [pieDataPath]);

	useEffect(() => {
		request(pieDataPath).then(res => {
			const nodes = res.data.nodes;
			eventBus.emit('updatePieData', nodes);
		});
	}, []);


	// CoreBar数据测试
	const [coreBarDataPath, setCoreBarDataPath] = useState("/mock/core_industry.json");

	const updateCoreBarData = () => {
		setCoreBarDataPath(prev => {
			// console.log('执行1111');
			if (prev === "/mock/core_industry.json") {
				// console.log('执行a');
				return "/mock/core_industry2.json";
			} else {
				// console.log('执行b');
				return "/mock/core_industry.json";
			}
		});
	};

	useEffect(() => {
		request(coreBarDataPath).then(res => {
			eventBus.emit('updateCoreBarData', res.data);
		});
	}, [coreBarDataPath]);

	useEffect(() => {
		request(coreBarDataPath).then(res => {
			eventBus.emit('updateCoreBarData', res.data);
		});
	}, []);

	return (
		<div className="flex h-50px">
			<button onClick={updatePieData} className="w-150px border h-30px">修改pie数据</button>
			<button onClick={updateCoreBarData} className="w-150px border h-30px">修改coreBar数据</button>
		</div>
	);
};
