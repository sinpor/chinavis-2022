import { EChartsType } from 'echarts';
import { observer } from 'mobx-react';
import { useContext, useEffect, useRef } from 'react';
import { StoreContext } from '../../../store';
import * as echarts from 'echarts';
import { NodeTypeNames } from '../../../types';

const option = {
  backgroundColor: '#fff',
  title: {
    text: '节点类型分布',
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
      name: '节点类型',
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
        //   formatter: (params) => {
        //     return industryName[params.data.name];
        //   },
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
      // animationDelay: function (idx) {
      //   return Math.random() * 200;
      // },
    },
  ],
};

export const NodeTypePie = observer(() => {
  const store = useContext(StoreContext);

  const { nodes } = store.currentData;

  const container = useRef<HTMLDivElement>(null);

  const chart = useRef<EChartsType>();

  useEffect(() => {
    chart.current = echarts.init(container.current as HTMLDivElement);
    chart.current.setOption(option);

    function onResize() {
      chart.current?.resize();
    }

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    const useData = Object.values(
      nodes?.reduce<any>((obj, d) => {
        const o = obj[d.label] || { value: 0, name: NodeTypeNames[d.label] };
        o.value++;
        obj[d.label] = o;
        return obj;
      }, {}) || {}
    );

    chart.current?.setOption({
      series: {
        data: useData,
      },
    });
  }, [nodes]);

  return <div ref={container} className="h-full w-full"></div>;
});
