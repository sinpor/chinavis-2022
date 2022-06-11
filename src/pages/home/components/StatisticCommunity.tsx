import { Statistic } from 'antd';
import { observer } from 'mobx-react';
import { useContext, useMemo } from 'react';
import { StoreContext } from '../../../store';

export default observer(function StatisticCommunity() {
	
  const { curCommunity, communityList, currentData } = useContext(StoreContext);
	
  const currentNodeNum = useMemo(
    () => currentData?.nodes?.length,
    [currentData]
  );
	
  const currentLinkNum = useMemo(
    () => currentData?.links?.length,
    [currentData]
  );
	
  return (
    <div className="flex mx-2 justify-between">
      <div className="">
        <Statistic title="当前社区" value={curCommunity || ''} groupSeparator="" className="text-center" />
      </div>
      <div className="">
        <Statistic title="节点数量" value={currentNodeNum} className="text-center" />
      </div>
      <div className="">
        <Statistic title="边数量" value={currentLinkNum} className="text-center" />
      </div>
    </div>
  );
});
