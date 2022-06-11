import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import ReactEcharts from 'echarts-for-react';
import { request } from '../../../utils/request/request';
import { eventBus } from '../../../utils/bus/bus';
import { httpSelectCommunity } from '../../../utils/request/httpRequest';

import * as echarts from 'echarts/core';
import { TooltipComponent, GridComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { store } from '../../../store';
import { observer } from 'mobx-react';
import Icon from '@ant-design/icons';
import { Tooltip, Button } from 'antd';

echarts.use([TooltipComponent, GridComponent, LegendComponent, DataZoomComponent, BarChart, CanvasRenderer]);

export const List: React.FC = observer(() => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [communityData, setCommunityData] = useState({});

  const [communityList, setCommunityList] = useState([]);

  const [curCommunity, setCurCommunity] = useState(-1);

  let comBarChart: echarts.ECharts;

  let lastCommunity = 1;

  const updateComBar = useCallback((Cname: any, allCom: any, crimeCom: any) => {
    comBarChart.setOption({
      yAxis: {
        data: Cname,
      },
      series: [{ data: crimeCom }, { data: allCom }],
    });
  }, []);

  const selectedBorder = useCallback((community: any, comList: any) => {
    // console.log("当前社区 ", community);
    // console.log("当前社区列表 ", comList);
    // console.log("当前图表 ", comBarChart._model.option.yAxis[0].data);
    let targetCommunityId = comList.findIndex((com: any) => com.community === community);
    const zeroCommunityId = comList.findIndex((com: any) => com.community === 0);
    if (zeroCommunityId < targetCommunityId) {
      targetCommunityId--;
    }
    comBarChart.dispatchAction({
      type: 'select',
      seriesId: 'comchart',
      dataIndex: targetCommunityId,
    });
    // console.log("index ", targetCommunityId);
    // console.log("index ", targetCommunityId);
  }, []);

  // 点击事件（选择社区）
  const setClickEvent = useCallback((curCommunity: any, communityList: any) => {
    comBarChart.off('click');
    comBarChart.on('click', (params) => {
      const num = parseInt(params.name.split(' ')[1]);
      console.log('curCommunity1111: ', curCommunity);
      // console.log("communityList: ", communityList);
      // console.log("tempClick", num);
      if (lastCommunity != num) {
        httpSelectCommunity({ community: num })?.then((res) => {
          store.updateInitData({
            ...store.initData,
            curCommunity: res.curCommunity,
          });
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
          type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
        },
      },
      legend: { show: false },

      grid: {
        top: '2%',
        left: '2%',
        right: '10%',
        bottom: '2%',
        containLabel: true,
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
        data: [],
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
          barWidth: '20px',
          color: '#4376b7',
          label: {
            show: false,
          },
          showBackground: true,
          emphasis: {
            focus: 'none',
          },
          z: 5,
          silent: true,
          data: [],
        },
        {
          id: 'comchart',
          type: 'bar',
          barWidth: '20px',
          color: '#c0d7ef',
          barGap: '-100%',
          label: {
            show: false,
          },
          emphasis: {
            focus: 'none',
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
              shadowBlur: 5,
            },
          },
          data: [],
        },
      ],
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
      setCurCommunity(data);
      store.updateCurCommunity(data);
    };

    // 更新列表（回调）
    const updateCommunityList = (communityList) => {
      const list = communityList.slice().sort((a, b) => b.nodeNum - a.nodeNum);
      setCommunityList(list);
      store.updateCommunityList(list);
    };

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
  const communityListData = useCallback((communityList: any) => {
    const name = [];
    const comNum = [];
    const crimeNum = [];
    // let i = 0;
    for (const com of communityList) {
      if (com.community !== 0 && com.nodeNum > 200) {
        name.push(`社区 ${com.community}`);
        comNum.push(com.nodeNum);
        crimeNum.push(com.industryNum);
      }
    }
    setCommunityData({
      Cname: name,
      allCom: comNum,
      crimeCom: crimeNum,
    });
  }, []);

  // 按节点数量排序
  const sortNodeNumBtn = () => {
    communityListData(communityList.sort((a: any, b: any) => b.nodeNum - a.nodeNum));
  };

  // 按节点黑产数量排序
  const sortIndustryNumBtn = () => {
    communityListData(communityList.sort((a: any, b: any) => b.industryNum - a.industryNum));
  };

  // 监听数据修改
  useEffect(() => {
    communityListData(communityList);
  }, [communityList]);

  useEffect(() => {
    updateComBar(communityData.Cname, communityData.allCom, communityData.crimeCom);
  }, [communityData]);

  useEffect(() => {
    console.log('newList: ', curCommunity);
    selectedBorder(curCommunity, communityList);
  }, [curCommunity]);

  useEffect(() => {
    setClickEvent(curCommunity, communityList);
  }, [curCommunity]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center">
        <div className="font-medium text-lg">社区列表</div>
        <div>
          <Tooltip title="按节点数量排序">
            <Button
              icon={
                <Icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 576 512">
                    <path
                      fill="currentColor"
                      d="M416 288h-95.1c-17.67 0-32 14.33-32 32s14.33 32 32 32H416c17.67 0 32-14.33 32-32S433.7 288 416 288zM544 32h-223.1c-17.67 0-32 14.33-32 32s14.33 32 32 32H544c17.67 0 32-14.33 32-32S561.7 32 544 32zM352 416h-32c-17.67 0-32 14.33-32 32s14.33 32 32 32h32c17.67 0 31.1-14.33 31.1-32S369.7 416 352 416zM480 160h-159.1c-17.67 0-32 14.33-32 32s14.33 32 32 32H480c17.67 0 32-14.33 32-32S497.7 160 480 160zM192.4 330.7L160 366.1V64.03C160 46.33 145.7 32 128 32S96 46.33 96 64.03v302L63.6 330.7c-6.312-6.883-14.94-10.38-23.61-10.38c-7.719 0-15.47 2.781-21.61 8.414c-13.03 11.95-13.9 32.22-1.969 45.27l87.1 96.09c12.12 13.26 35.06 13.26 47.19 0l87.1-96.09c11.94-13.05 11.06-33.31-1.969-45.27C224.6 316.8 204.4 317.7 192.4 330.7z"
                    />
                  </svg>
                </Icon>
              }
              type="link"
              onClick={sortNodeNumBtn}
            ></Button>
          </Tooltip>
          <Tooltip title="按黑产数量排序">
            <Button
              icon={
                <Icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 576 512">
                    <path
                      fill="currentColor"
                      d="M416 288h-95.1c-17.67 0-32 14.33-32 32s14.33 32 32 32H416c17.67 0 32-14.33 32-32S433.7 288 416 288zM352 416h-32c-17.67 0-32 14.33-32 32s14.33 32 32 32h32c17.67 0 31.1-14.33 31.1-32S369.7 416 352 416zM480 160h-159.1c-17.67 0-32 14.33-32 32s14.33 32 32 32H480c17.67 0 32-14.33 32-32S497.7 160 480 160zM544 32h-223.1c-17.67 0-32 14.33-32 32s14.33 32 32 32H544c17.67 0 32-14.33 32-32S561.7 32 544 32zM151.6 41.95c-12.12-13.26-35.06-13.26-47.19 0l-87.1 96.09C4.475 151.1 5.35 171.4 18.38 183.3c6.141 5.629 13.89 8.414 21.61 8.414c8.672 0 17.3-3.504 23.61-10.39L96 145.9v302C96 465.7 110.3 480 128 480s32-14.33 32-32.03V145.9L192.4 181.3C204.4 194.3 224.6 195.3 237.6 183.3c13.03-11.95 13.9-32.22 1.969-45.27L151.6 41.95z"
                    />
                  </svg>
                </Icon>
              }
              type="link"
              onClick={sortIndustryNumBtn}
            ></Button>
          </Tooltip>
        </div>
      </div>
      <div ref={containerRef} className="flex flex-1 m-1"></div>
    </div>
  );
});
