import { Tag } from 'antd';
import React, { useMemo } from 'react';
import { INodeData, NodeTypeNames } from '../../../types';
import { getIndustryColor, getIndustryNames } from '../../../utils/utils';

export const NodePopover: React.FC<{
  x: number;
  y: number;
  show: boolean;
  nodeData: INodeData;
  onChangeShow?: (show: boolean) => void;
}> = ({ x, y, show, nodeData, onChangeShow }) => {
  const industryNames = useMemo(() => getIndustryNames(nodeData.industry), [nodeData.industry]);
  return (
    <div
      className={`m-2 absolute min-w-100px max-w-500px bg-blue-200 bg-opacity-80 p-4 rounded-md border-solid border border-blue-200 break-words z-99 transition-all duration-300 ${
        !show ? ' hidden' : ''
      }`}
      style={{ left: x + 'px', top: y + 'px' }}
      onMouseEnter={() => onChangeShow?.(true)}
      onMouseLeave={() => onChangeShow?.(false)}
    >
      <div className="font-medium text-lg">{nodeData.name}</div>
      <div className="">
        <div className="my-2">
          <span className="pr-2 text-gray-500">节点类型: </span>
          <span>{NodeTypeNames[nodeData.label]}</span>
        </div>
        <div className="my-2">
          <span className="pr-2 text-gray-500">黑产类型: </span>
          <span>
            {nodeData.industry?.map((d, i) => (
              <Tag key={d} color={getIndustryColor(d)}>
                {industryNames[i]}
              </Tag>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
};