import React, { useCallback, useEffect, useRef, useState } from "react";
import { request } from "../../../utils/request/request";
import { eventBus } from "../../../utils/bus/bus";
// import ReactEcharts from "echarts-for-react";
import * as echarts from 'echarts/core';
import {
	TooltipComponent,
	GridComponent,
	LegendComponent,
	DataZoomComponent
} from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
	TooltipComponent,
	GridComponent,
	LegendComponent,
	DataZoomComponent,
	BarChart,
	CanvasRenderer
]);


export const CoreBar: React.FC = () => {

	const industryName = {
		'A': '涉黄',
		'B': '涉赌',
		'C': '诈骗',
		'D': '涉毒',
		'E': '涉枪',
		'F': '黑客',
		'G': '非法交易平台',
		'H': '非法支付平台',
		'I': '其他'
	};

	const containerRef = useRef<HTMLDivElement>(null);

	let nodeId;
	let series;

	let barChart;

	const [coreBarData, setCoreBarData] = useState({
		"nodeId": [],
		"series": [],
	});

	const updateCoreBar = useCallback(
		(nodeId: any[], series: any[]) => {

			const data = [];

			series.map(barData => {
				data.push({
					name: industryName[barData.name],
					id: barData.name,
					type: 'bar',
					stack: 'total',
					label: {
						show: true,
					},
					emphasis: {
						focus: 'series',
					},
					barMaxWidth: 30,
					barMinWidth: 15,
					// barCategoryGap: 20,
					data: barData.data
				});
			});

			barChart.setOption({
				series: data,
				yAxis: {
					data: nodeId
				}
			});

		}
	);

	useEffect(() => {
		barChart = echarts.init(containerRef.current, null, {
			renderer: 'canvas',
			useDirtyRect: false
		});
		const option = {
			backgroundColor: '#fff',
			title: {
				text: '核心资产分析',
				left: 'center',
				top: 10,
				textStyle: {
					color: '#333'
				}
			},
			dataZoom: [
				{
					type: 'slider',
					realtime: true,
					orient: 'vertical',
					handleSize: 0,
					moveHandleSize: 10,
					brushSelect: false,
					// borderColor: 'transparent',
					handleStyle: {
						borderCap: 'round',
					},
					fillerColor: 'rgba(0,0,0,0.2)',
					// handleIcon: 'path://M30.9,53.2C16.8,53.2,5.3,41.7,5.3,27.6S16.8,2,30.9,2C45,2,56.4,13.5,56.4,27.6S45,53.2,30.9,53.2z M30.9,3.5M36.9,35.8h-1.3z M27.8,35.8 h-1.3H27L27.8,35.8L27.8,35.8z',
					// backgroundColor: 'rgba(0, 0, 0, 0)',
					showDetail: false,
					showDataShadow: false,
					maxValueSpan: 6,
					minValueSpan: 4,
					width: 8,
					throttle: 10,
					height: '70%',
					top: '20%',
					right: '2%'
				},
				{
					type: 'inside',
					maxValueSpan: 6,
					minValueSpan: 4,
					orient: 'vertical',
					filterMode: 'none',
					zoomOnMouseWheel: 'ctrl',
					moveOnMouseWheel: true
				}
			],

			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				},
			},
			legend: {
				top: 40,
				align: 'left'
			},
			grid: {
				left: '2%',
				right: '9%',
				top: 90,
				bottom: 10,
				containLabel: true
			},
			xAxis: {
				type: 'value'
			},
			yAxis: {
				type: 'category',
				data: [],
				boundaryGap: true,
				axisLabel: {
					// show: false,
					width: 50,
					overflow: 'truncate'
				}
			},
			series: []
		};

		if (option && typeof option === 'object') {
			barChart.setOption(option);
		}

		window.addEventListener('resize', barChart.resize);

		barChart.on('mouseover', function(params) {
			console.log(params.name);
			console.log(params.seriesId);
		});
		barChart.on('mouseout', function(params) {
			console.log('leave');
		});

		const updateCoreBarData = (nodes_data) => {
			setCoreBarData(nodes_data);
		};

		eventBus.addListener("updateCoreBarData", updateCoreBarData);

		return () => {
			barChart.off('mouseover');
			barChart.off('mouseout');
			eventBus.removeListener("updateCoreBarData", updateCoreBarData);
		}
	});

	useEffect(() => {
		nodeId = coreBarData.nodeId;
		series = coreBarData.series.sort((a, b) => {
			return a.name.charCodeAt() - b.name.charCodeAt();
		});
		updateCoreBar(nodeId, series);

	}, [coreBarData]);

	return (
		<div ref={containerRef} className="w-full h-50vh">
		</div>
	);
};