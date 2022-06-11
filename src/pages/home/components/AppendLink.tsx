import { Button, Form, Input, message, Modal, Space } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { store } from '../../../store';
import { IForceData, INodeData } from '../../../types';
import { findShortestPath } from '../../../utils/request/httpRequest';
import { NodeTable } from './NodeTable';
const { useForm } = Form;

export const AppendLink = () => {
  const [form] = useForm();

  const [show, setShow] = useState(false);

  const [tableData, setTableData] = useState<INodeData[]>([]);

  const appendData = useRef<IForceData>();

  useEffect(() => {
    if (show) return;
    form.resetFields();
    setTableData([]);
  }, [show]);

  function onFinish(values: any) {
    findShortestPath({
      node1Uid: values.node1Uid,
      node2Uid: values.node2Uid,
    }).then((res) => {
      const nodes = res.data.nodes.map((d) => ({ ...d, industry: eval(d.industry as any) }));
      appendData.current = { links: res.data.links, nodes };
      setTableData(nodes);
    });
  }

  //   function handleSelected(e: INodeData[]) {}

  function handleOk() {
    if (!appendData.current?.nodes?.length) {
      message.warning('无可添加节点');
      return;
    }

    store.updateAppendLinks(appendData.current as IForceData);
    setShow(false);
  }
  return (
    <>
      <Button type="primary" onClick={() => setShow(true)}>
        234
      </Button>

      <Modal
        width={'80vw'}
        title="添加连接"
        visible={show}
        getContainer={false}
        onCancel={() => setShow(false)}
        onOk={handleOk}
        destroyOnClose
        okText="添加"
      >
        <div className="mb-4">
          <Form form={form} layout="inline" onFinish={onFinish}>
            <Form.Item name="node1Uid" label="">
              <Input allowClear placeholder="请输入uid" />
            </Form.Item>

            <Form.Item name="node2Uid" label="">
              <Input allowClear placeholder="请输入uid" />
            </Form.Item>

            <Form.Item shouldUpdate>
              {() => (
                <Space>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                </Space>
              )}
            </Form.Item>
          </Form>
        </div>

        <NodeTable<INodeData> data={tableData} />
      </Modal>
    </>
  );
};
