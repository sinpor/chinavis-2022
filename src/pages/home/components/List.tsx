import React, { useEffect, useState, useCallback } from "react";
import ReactEcharts from 'echarts-for-react';
import { request } from "../../../utils/request/request";
import { eventBus } from "../../../utils/bus/bus";
import { httpSelectCommunity } from "../../../utils/request/httpRequest";


export const List: React.FC = () => {

	const [communityData, setCommunityData] = useState({
		// Cname: [],
		// allCom: [],
		// crimeCom: []
	});

	const [communityList, setCommunityList] = useState([]);

	const getOption = () => {
		let option = {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					// Use axis to trigger tooltip
					type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
				}
			},
			legend: { show: false },

			grid: {
				top: '2%',
				left: '2%',
				right: '10%',
				bottom: '2%',
				containLabel: true
			},
			xAxis: {
				type: 'value',
				position: 'top',
				axisLine: { show: false }, // 轴线
				axisTick: { show: true }, // 刻度
				splitLine: { show: false }, // 分隔线
				// axisLabel: false
			},
			yAxis: {
				type: 'category',
				axisLine: { show: false }, // 轴线
				axisTick: { show: false }, // 刻度
				splitLine: { show: false }, // 分隔线
				inverse: true,
				data: communityData.Cname
			},
			dataZoom: [
				{
					type: 'slider',
					realtime: true,
					orient: 'vertical',
					handleSize: 0,
					moveHandleSize: 6,
					brushSelect: true,
					// borderColor: 'transparent',
					fillerColor: 'rgba(0,255,0,1)',

					moveHandleStyle: {
						color: 'rgba(200,200,200,1)',
						borderColor: 'rgba(200,200,200,1)',
						borderWidth: 6,
						borderCap: 'round',
						borderJoin: 'round',
						opacity: 1,
					},
					borderColor: 'rgba(150,150,150,1)',
					showDetail: false,
					showDataShadow: true,
					maxValueSpan: 20,
					minValueSpan: 20,
					width: 0,
					throttle: 10,
					// height: '70%',
					top: 35,
					bottom: 20,
					right: '6%',
				},
				{
					type: 'inside',
					maxValueSpan: 20,
					minValueSpan: 20,
					orient: 'vertical',
					filterMode: 'none',
					zoomOnMouseWheel: false,
					moveOnMouseWheel: true,
				},
			],

			series: [
				{
					type: 'bar',
					barWidth: "20px",
					// stack: 'total',
					color: "#4376b7",
					label: {
						show: false
					},
					showBackground: true,
					emphasis: {
						focus: 'none'
					},
					z: 5,
					silent: true,
					data: communityData.crimeCom,
				},
				{
					type: 'bar',
					barWidth: "20px",
					// stack: 'total',
					color: "#c0d7ef",
					barGap: '-100%',
					label: {
						show: false
					},
					emphasis: {
						focus: 'none'
					},
					backgroundStyle: {
						color: '#f0f2f5',
					},
					selectedMode: 'single',
					select: {
						itemStyle: {
							// color: '#FFB040',
							borderColor: '#FF9500',
							borderWidth: 2,
							shadowColor: '#FF9500',
							shadowBlur: 5
						}
					},
					data: communityData.allCom
				}
			]
		};
		return option;
	};

	const onChartClick = (param: any, echarts: any) => {
		let num = param.name.split(" ")[1];
		eventBus.emit("ComId", num);
	}

	const getClick = {
		'click': onChartClick
	};

	const SearchId = (value: string) => {
		console.log("list---", value);
	}



	// 更新列表（回调）
	const updateCommunityList = useCallback((communityList) => {
		setCommunityList(communityList.sort((a, b) => b.nodeNum - a.nodeNum));
	}, []);

	// 数据更新（回调）
	const communityListData = useCallback((communityList) => {
		const name = [];
		const comNum = [];
		const crimeNum = [];
		for (const com of communityList) {
			if (com.community !== 0) {
				name.push(`社区 ${com.community}`);
				comNum.push(com.nodeNum);
				crimeNum.push(com.industryNum);
			}
		}
		setCommunityData({
			Cname: name,
			allCom: comNum,
			crimeCom: crimeNum
		});
	}, []);

	// 按节点数量排序
	const sortNodeNumBtn = () => {
		communityListData(communityList.sort((a, b) => b.nodeNum - a.nodeNum));
	}

	// 按节点黑产数量排序
	const sortIndustryNumBtn = () => {
		communityListData(communityList.sort((a, b) => b.industryNum - a.industryNum));
	}


	// 初始化数据监听
	useEffect(() => {
		console.log('初始化监听器');
		eventBus.addListener("clue", SearchId);
		eventBus.addListener('updateCommunityList', updateCommunityList);
		return () => {
			eventBus.removeListener('updateCommunityList', updateCommunityList);
			eventBus.removeListener("clue", SearchId);
		}
	}, []);
 
	// 监听数据修改
	useEffect(() => {
		// console.log('监听到数据更新');
		// console.log(communityList);
		communityListData(communityList);
	}, [communityList])

	return (
		<div className="h-700px">
			<div className="flex h-7%">
				<button onClick={sortNodeNumBtn} className="w-1/2 border h-30px">按节点数量排序</button>
				<button onClick={sortIndustryNumBtn} className="w-1/2 border h-30px">按黑产数量排序</button>
			</div>
			<ReactEcharts className='border'
				style={{ height: '93%', width: '100%' }}
				option={getOption()}
				onEvents={getClick}
			/>
		</div>
	)

};