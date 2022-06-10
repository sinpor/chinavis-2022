import React, { useEffect, useState, useCallback, useRef } from "react";
import ReactEcharts from 'echarts-for-react';
import { request } from "../../../utils/request/request";
import { eventBus } from "../../../utils/bus/bus";
import { httpSelectCommunity } from "../../../utils/request/httpRequest";

import * as echarts from 'echarts/core';
import { TooltipComponent, GridComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { store } from "../../../store";

echarts.use([TooltipComponent, GridComponent, LegendComponent, DataZoomComponent, BarChart, CanvasRenderer]);


export const List: React.FC = () => {

	const containerRef = useRef<HTMLDivElement>(null);

	const [communityData, setCommunityData] = useState({});

	const [communityList, setCommunityList] = useState([]);

	const [curCommunity, setCurCommunity] = useState(107);

	let comBarChart: echarts.ECharts;

	let lastCommunity = 1;

	const updateComBar = useCallback((Cname, allCom, crimeCom) => {
		comBarChart.setOption({
			yAxis: {
				data: Cname,
			},
			series: [
				{ data: crimeCom },
				{ data: allCom },
			]
		});
	}, []);

	const selectedBorder = useCallback((community, comList) => {
		// console.log("当前社区 ", community);
		// console.log("当前社区列表 ", comList);
		// console.log("当前图表 ", comBarChart._model.option.yAxis[0].data);
		let targetCommunityId = comList.findIndex((com) => com.community === community);
		const zeroCommunityId = comList.findIndex((com) => com.community === 0);
		if (zeroCommunityId < targetCommunityId) {
			targetCommunityId--;
		}
		comBarChart.dispatchAction({
			type: 'select',
			seriesId: 'comchart',
			dataIndex: targetCommunityId
		});
		// console.log("index ", targetCommunityId);
		// console.log("index ", targetCommunityId);
	}, []);


	// 点击事件（选择社区）
	const setClickEvent = useCallback((curCommunity, communityList) => {
		comBarChart.off('click');
		comBarChart.on('click', (params) => {
			const num = params.name.split(" ")[1];
			console.log("curCommunity1111: ", curCommunity);
			// console.log("communityList: ", communityList);
			// console.log("tempClick", num);
			if (lastCommunity !== num) {
				httpSelectCommunity({ community: num })?.then(res => {
					store.updateInitData({
						...store.initData,
						curCommunity: res.curCommunity
					})
					store.updateCurrentData(res);
				});
				lastCommunity = num;
			}
		});
	}, []);


	useEffect(() => {
		comBarChart = echarts.init(containerRef.current, null, {
			renderer: 'canvas',
			useDirtyRect: false,
		});

		const option = {
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
					id: 'comchart',
					type: 'bar',
					barWidth: "20px",
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

		if (option && typeof option === 'object') {
			comBarChart.setOption(option);
		}

		window.addEventListener('resize', comBarChart.resize);

		// comBarChart.on('mouseover', function(params) {
		// 	console.log(params.name);
		// 	console.log(params.seriesId);
		// });
		// comBarChart.on('mouseout', function(params) {
		// 	console.log('leave');
		// });


		// 更新当前社区编号
		const updateCurCommunity = (data) => {
			setCurCommunity(data)
		}

		// 更新列表（回调）
		const updateCommunityList = (communityList) => {
			setCommunityList(communityList.sort((a, b) => b.nodeNum - a.nodeNum));
		}

		eventBus.addListener('updateCurCommunity', updateCurCommunity);
		eventBus.addListener('updateCommunityList', updateCommunityList);

		return () => {
			comBarChart.off('mouseover');
			comBarChart.off('mouseout');
			comBarChart.off('click');
			eventBus.removeListener('updateCurCommunity', updateCurCommunity);
			eventBus.removeListener('updateCommunityList', updateCommunityList);
		};

	}, []);

	// 数据更新（回调）
	const communityListData = (communityList) => {
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
	}

	// 按节点数量排序
	const sortNodeNumBtn = () => {
		communityListData(communityList.sort((a, b) => b.nodeNum - a.nodeNum));
	}

	// 按节点黑产数量排序
	const sortIndustryNumBtn = () => {
		communityListData(communityList.sort((a, b) => b.industryNum - a.industryNum));
	}

	// 监听数据修改
	useEffect(() => {
		communityListData(communityList);
	}, [communityList])

	useEffect(() => {
		updateComBar(communityData.Cname, communityData.allCom, communityData.crimeCom);
	}, [communityData]);

	useEffect(() => {
		console.log("newList: ", curCommunity);
		selectedBorder(curCommunity, communityList);
	}, [curCommunity, communityList]);

	useEffect(() => {
		setClickEvent(curCommunity, communityList);
	}, [curCommunity]);


	return (
		<div className="h-700px">
			<div className="flex h-50px">
				<button onClick={sortNodeNumBtn} className="w-1/2 border h-30px">按节点数量排序</button>
				<button onClick={sortIndustryNumBtn} className="w-1/2 border h-30px">按黑产数量排序</button>
			</div>
			<div ref={containerRef} className="w-full h-650px"></div>
		</div>
	);

	// return (
	// 	<div className="h-700px">
	// 		<div className="flex h-7%">
	// 			<button onClick={sortNodeNumBtn} className="border h-30px w-1/2">按节点数量排序</button>
	// 			<button onClick={sortIndustryNumBtn} className="border h-30px w-1/2">按黑产数量排序</button>
	// 		</div>
	// 		<ReactEcharts className='border'
	// 			style={{ height: '93%', width: '100%' }}
	// 			option={getOption()}
	// 			onEvents={getClick}
	// 		/>
	// 	</div>
	// )

};