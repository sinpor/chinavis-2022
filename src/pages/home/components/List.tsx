import React, { useEffect, useState } from "react";
import ReactEcharts from 'echarts-for-react';
import { request } from "../../../utils/request/request";
import { eventBus } from "../../../utils/bus/bus";

export const List: React.FC = () => {
    const [Cname, setCname] = useState([]);
    const [allCom, setallCom] = useState([]);
    const [crimeCom, setcrimeCom] = useState([]);
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
                top: '5%',
                left: '3%',
                right: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisLine: { show: false }, // 轴线
                axisTick: { show: false }, // 刻度
                splitLine: { show: false }, // 分隔线
                axisLabel: false
            },
            yAxis: {
                type: 'category',
                axisLine: { show: false }, // 轴线
                axisTick: { show: false }, // 刻度
                splitLine: { show: false }, // 分隔线
                inverse: true,
                data: Cname
            },
            dataZoom: [
                {
                    type: "inside",
                    yAxisIndex: [0],
                    zoomOnMouseWheel: false,  // 关闭滚轮缩放
                    moveOnMouseWheel: true, // 开启滚轮平移
                    moveOnMouseMove: true,  // 鼠标移动能触发数据窗口平移 
                    maxValueSpan: 10,

                },
                {
                    id: 'dataZoomY',
                    show: true,
                    type: 'slider',
                    yAxisIndex: [0],
                    filterMode: 'empty',
                    width: '5',
                    fillerColor: "gray", // 滚动条颜色
                    // borderColor: "rgba(17, 100, 210, 0.12)",
                    backgroundColor: '#cfcfcf',
                    handleSize: 0,
                    showDataShadow: false,
                    showDetail: false,
                    height: '100%',
                    startValue: 0,
                },

            ],
            series: [
                {
                    type: 'bar',
                    barWidth: "20px",
                    stack: 'total',
                    label: {
                        show: true
                    },
                    color: "#4376b7",
                    showBackground: true,
                    backgroundStyle: {
                        color: '#f0f2f5',
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: allCom
                },
                {
                    type: 'bar',
                    barWidth: "20px",
                    stack: 'total',
                    color: "#c0d7ef",
                    label: {
                        show: true
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: crimeCom
                }
            ]
        };
        return option;
    };
    const onChartClick = (param: any, echarts: any) => {
        let num = param.name.split(" ")[1]
        eventBus.emit("ComId", num);
    }
    const getClick = {
        'click': onChartClick
    };
    const SearchId = (value: string) => {
        console.log("list---", value);
    }
    eventBus.addListener("clue", SearchId)
    useEffect(() => {
        request("/mock/test-community.json").then((res) => {
            let name = res.data.yAxis.map((item: number) => {
                return `社区 ${item}`
            })
            setCname(name)
            setallCom(res.data.allCom);
            setcrimeCom(res.data.crimeCom)
        });
    }, []);
    return (
        <ReactEcharts
            style={{ height: '600px', width: '100%' }}
            option={getOption()}
            onEvents={getClick}
        />
    )

};