import React, { useCallback, useEffect, useRef, useState } from 'react';
import { request } from '../../../utils/request/request';
import { eventBus } from '../../../utils/bus/bus';
// import ReactEcharts from "echarts-for-react";
import * as echarts from 'echarts/core';
import { TooltipComponent, TitleComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { store } from '../../../store';
import { observer } from 'mobx-react';

echarts.use([TooltipComponent, TitleComponent, PieChart, CanvasRenderer, LabelLayout]);

export const Pie: React.FC = observer(() => {
  const industryName = {
    A: '涉黄',
    B: '涉赌',
    C: '诈骗',
    D: '涉毒',
    E: '涉枪',
    F: '黑客',
    G: '非法交易平台',
    H: '非法支付平台',
    I: '其他',
  };

  const industryColor = {
    A: '#5470c6',
    B: '#91cc75',
    C: '#fac858',
    D: '#ee6666',
    E: '#73c0de',
    F: '#3ba272',
    G: '#fc8452',
    H: '#9a60b4',
    I: '#ea7ccc',
  };

  let pieChart: any;

  const containerRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useState([]);

  const updatePie = useCallback((pie_data: any[]) => {
    pieChart.setOption({
      series: [
        {
          data: pie_data.sort((a, b) => {
            return a.name.charCodeAt() - b.name.charCodeAt();
          }),
        },
      ],
    });
  }, []);

  const setHoverEvent = useCallback((count) => {
    pieChart.on('click', function (params) {
      const nodesover = count[params.data.name];
      store.updateSelectedNodes(nodesover);
      console.log(params.data.name);
    });
  }, []);

  useEffect(() => {
    pieChart = echarts.init(containerRef.current, null, {
      renderer: 'canvas',
      useDirtyRect: false,
    });

    const option = {
      backgroundColor: '#fff',
      title: {
        text: '黑灰产业分布',
        left: 'center',
        top: 10,
        textStyle: {
          color: '#333',
        },
      },
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          name: 'industry',
          type: 'pie',
          radius: ['35%', '60%'],
          center: ['50%', '60%'],
          data: [],
          // roseType: 'radius',
          minAngle: 10,
          label: {
            color: 'rgba(20, 20, 20, 0.3)',
            fontSize: 14,
            fontWeight: 'bolder',
            formatter: (params) => {
              return industryName[params.data.name];
            },
          },
          labelLine: {
            lineStyle: {
              color: 'rgba(20, 20, 20, 0.3)',
            },
            smooth: 0.2,
            length: 10,
            length2: 20,
          },
          itemStyle: {
            // color: '#c23531',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
          },
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function (idx) {
            return Math.random() * 200;
          },
        },
      ],
    };

    if (option && typeof option === 'object') {
      pieChart.setOption(option);
    }

    window.addEventListener('resize', pieChart.resize);

    // pieChart.on('mouseout', function (params) {
    //   store.updateSelectedNodes([]);
    //   console.log('leave');
    // });

    const updatePieData = (nodes_data) => {
      setNodes(nodes_data);
    };

    eventBus.addListener('updatePieData', updatePieData);

    return () => {
      pieChart.off('mouseover');
      pieChart.off('mouseout');
      eventBus.removeListener('updatePieData', updatePieData);
    };
  }, []);

  useEffect(() => {
    const pie_data: any = [];
    // const nodes = nodes_data;
    const count = {};
    for (const node of nodes) {
      const industry = eval(node.industry);
      for (const item of industry) {
        if (item in count) count[item].push(node.id);
        else count[item] = [node.id];
      }
    }
    Object.keys(count).forEach((key) => {
      pie_data.push({ name: key, value: count[key].length, itemStyle: { color: industryColor[key] } });
    });

    updatePie(pie_data);
    setHoverEvent(count);
  }, [nodes]);

  return <div ref={containerRef} className="h-full w-full"></div>;
});
