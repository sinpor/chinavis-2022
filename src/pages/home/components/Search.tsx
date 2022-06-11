import React, { useEffect, useState, useContext } from 'react';
import { Input, Space } from 'antd';
import { AudioOutlined } from '@ant-design/icons';
import { request } from '../../../utils/request/request';
import { httpSearchNode } from '../../../utils/request/httpRequest';

import { observer } from 'mobx-react';
import { store } from '../../../store';

const { Search } = Input;

export const SearchId: React.FC = observer(() => {
  // const [curCommunity, setCurCommunity] = useState(-1);

  let state = true;
  // 搜索节点（按钮）
  const onSearch = (value: string) => {
    if (!state) return;
    state = false;
    httpSearchNode({ nodeUid: value })
      ?.then((res) => {
        if (!res.error) {
          // store.initData.error = res.error;
          // store.initData.curCommunity = res.curCommunity;
          store.updateInitData({
            ...store.initData,
            curCommunity: res.curCommunity,
            error: res.error,
          });
          store.updateCurrentData({ nodes: res.nodes, links: res.links });
        }
        state = true;
      })
      .then((res) => {
        for (const node of res.nodes) {
          if (node.uid === value) {
            store.updateSelectedNodes([node.uid]);
            break;
          }
        }
      })
      .catch((r) => {
        state = true;
      });
  };

  return (
    <Space direction="vertical" className="w-full">
      <Search placeholder="请输入网络资产线索" onSearch={onSearch} style={{ width: '100%' }} />
    </Space>
  );
});
