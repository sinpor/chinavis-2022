import React, { useCallback, useEffect, useRef, useState } from 'react';
import { request } from '../../../utils/request/request';
import { eventBus } from '../../../utils/bus/bus';
// import ReactEcharts from "echarts-for-react";
import * as echarts from 'echarts/core';
import { TooltipComponent, GridComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TooltipComponent, GridComponent, LegendComponent, DataZoomComponent, BarChart, CanvasRenderer]);

export const CoreBar: React.FC = () => {
  const industryName = {
    A: '涉黄',
    B: '涉赌',
    C: '诈骗',
    D: '涉毒',
    E: '涉枪',
    F: '黑客',
    G: '非法交易',
    H: '非法支付',
    I: '其他',
  };

  const containerRef = useRef<HTMLDivElement>(null);

  let barChart: echarts.ECharts;

  // const [nodes, setNodes] = useState([]);

  // const [links, setLinks] = useState([]);

  const [coreIndustry, setCoreIndustry] = useState({
    nodeIds: [],
    series: [],
  });

  const updateCoreBar = useCallback((nodeIds: any[], series: any[]) => {
    const dataZoomOption = [
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

        // handleIcon: 'path://M30.9,53.2C16.8,53.2,5.3,41.7,5.3,27.6S16.8,2,30.9,2C45,2,56.4,13.5,56.4,27.6S45,53.2,30.9,53.2z M30.9,3.5M36.9,35.8h-1.3z M27.8,35.8 h-1.3H27L27.8,35.8L27.8,35.8z',
        showDetail: false,
        showDataShadow: true,
        maxValueSpan: 9,
        minValueSpan: 4,
        width: 0,
        throttle: 10,
        // height: '70%',
        top: 100,
        bottom: 20,
        right: '6%',
      },
      {
        type: 'inside',
        maxValueSpan: 9,
        minValueSpan: 4,
        orient: 'vertical',
        filterMode: 'none',
        zoomOnMouseWheel: 'ctrl',
        moveOnMouseWheel: true,
      },
    ];

    const data = [];

    series.map((barData) => {
      data.push({
        name: industryName[barData.name],
        id: barData.name,
        type: 'bar',
        stack: 'total',
        label: {
          show: false,
        },
        emphasis: {
          focus: 'series',
        },
        barMaxWidth: 30,
        barMinWidth: 15,
        // barCategoryGap: 20,
        data: barData.data,
      });
    });

    barChart.setOption({
      series: data,
      yAxis: {
        data: nodeIds,
      },
      dataZoom: nodeIds.length > 8 ? dataZoomOption : [],
    });
  }, []);

  useEffect(() => {
    barChart = echarts.init(containerRef.current, null, {
      renderer: 'canvas',
      useDirtyRect: false,
    });

    const option = {
      backgroundColor: '#fff',
      title: {
        text: '核心资产分析',
        left: 'center',
        top: 10,
        textStyle: {
          color: '#333',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        top: 40,
        align: 'left',
        // data: [
        // 	{ name: '涉黄', itemStyle: { color: '#63b2ee' } },
        // 	{ name: '涉赌', itemStyle: { color: '#76da91' } },
        // 	{ name: '诈骗', itemStyle: { color: '#f8cb7f' } },
        // 	{ name: '涉毒', itemStyle: { color: '#f89588' } },
        // 	{ name: '涉枪', itemStyle: { color: '#7cd6cf' } },
        // 	{ name: '黑客', itemStyle: { color: '#9192ab' } },
        // 	{ name: '非法交易', itemStyle: { color: '#7898e1' } },
        // 	{ name: '非法支付', itemStyle: { color: '#efa666' } },
        // 	{ name: '其他', itemStyle: { color: '#eddd86' } },
        // ]
      },
      dataZoom: [],
      grid: {
        left: '1%',
        right: '12%',
        top: 90,
        bottom: 10,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        position: 'top',
        axisLine: { show: false }, // 轴线
        axisTick: { show: true }, // 刻度
        splitLine: { show: true }, // 分隔线
      },
      yAxis: {
        type: 'category',
        data: [],
        boundaryGap: true,
        axisLine: { show: false }, // 轴线
        axisTick: { show: false }, // 刻度
        inverse: true,
        axisLabel: {
          // show: false,
          width: 50,
          overflow: 'truncate',
        },
      },
      series: [],
    };

    if (option && typeof option === 'object') {
      barChart.setOption(option);
    }

    window.addEventListener('resize', barChart.resize);

    // barChart.on('mouseover', function(params) {
    // 	console.log(params.name);
    // 	console.log(params.seriesId);
    // });
    // barChart.on('mouseout', function(params) {
    // 	console.log('leave');
    // });

    const updateCoreBarData = (coreBarData) => {
      setCoreIndustry(coreBarData);
    };

    eventBus.addListener('updateCoreBarData', updateCoreBarData);

    return () => {
      barChart.off('mouseover');
      barChart.off('mouseout');
      eventBus.removeListener('updateCoreBarData', updateCoreBarData);
    };
  }, []);

  useEffect(() => {
    updateCoreBar(coreIndustry.nodeIds, coreIndustry.series);
  }, [coreIndustry]);

  return <div ref={containerRef} className="h-full w-full min-h-50vh"></div>;
};
