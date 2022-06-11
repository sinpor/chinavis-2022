import { Statistic } from 'antd';
import { observer } from 'mobx-react';
import { useContext, useMemo } from 'react';
import { StoreContext } from '../../../store';

export default observer(function StatisticCommunity() {
	
  const { curCommunity, communityList, currentData } = useContext(StoreContext);
	
  const currentNodeNum = useMemo(
    // () => (communityList.find((com: any) => com.community === curCommunity) as any)?.nodeNum,
    // [communityList, curCommunity]
    () => currentData?.nodes?.length,
    [currentData]
  );
	
  return (
    <div className="flex mx-2 justify-between">
      <div className="">
        <Statistic title="当前社区" value={curCommunity || ''} groupSeparator="" />
      </div>
      <div className="">
        <Statistic title="节点数量" value={currentNodeNum} />
      </div>
    </div>
  );
});
