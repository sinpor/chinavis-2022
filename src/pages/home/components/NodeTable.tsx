import { Popover, Table, Tag, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useMemo, useState } from 'react';
import { IndustryTypeNames, INodeData } from '../../../types';
import { getIndustryColor } from '../../../utils/utils';

export const NodeTable = <T extends object>(props: { data: T[]; onSelected?: (selected: T[]) => void }) => {
  const { data } = props;

  const [page, setPage] = useState(1);

  const columns = useMemo<ColumnsType<INodeData>>(
    () => [
      {
        title: 'uid',
        dataIndex: 'uid',
        ellipsis: true,
        render(v) {
          return <Tooltip title={v}>{v}</Tooltip>;
        },
      },
      {
        title: '名称',
        dataIndex: 'name',
        ellipsis: true,
        render(v) {
          return <Tooltip title={v}>{v}</Tooltip>;
        },
      },
      {
        title: '核心节点',
        dataIndex: 'isCore',
        render(_, row) {
          return row.isCore ? '是' : '否';
        },
      },
      {
        title: '节点类型',
        dataIndex: 'label',
      },
      {
        title: '黑产类型',
        dataIndex: 'industry',
        render(_, row) {
          const Tags = () => (
            <>
              {row.industry.map((d) => (
                <Tag key={d} color={getIndustryColor(d)}>
                  {IndustryTypeNames[d]}
                </Tag>
              ))}
            </>
          );
          return (
            <Popover trigger="hover" content={<Tags />}>
              <Tags />
            </Popover>
          );
        },
        ellipsis: true,
      },
      {
        title: '权重',
        dataIndex: 'weight',
        ellipsis: true,
        render(v) {
          return <Tooltip title={v}>{v}</Tooltip>;
        },
      },
    ],
    []
  );

  const rowSelection = {
    type: 'checkbox',
    onChange: (selectedRowKeys: React.Key[], selectedRows: T[]) => {
      props.onSelected?.(selectedRows);
    },
    getCheckboxProps: (record: INodeData) => ({
      name: record.id,
    }),
  };

  useEffect(() => {
    setPage(1);
  }, [data]);

  return (
    <Table
      rowSelection={rowSelection}
      rowKey="id"
      dataSource={data}
      columns={columns}
      pagination={{
        current: page,
        onChange(e) {
          setPage(e);
        },
      }}
    />
  );
};
