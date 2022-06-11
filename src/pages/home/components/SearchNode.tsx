import { Button, Form, Input, Modal, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { observer } from 'mobx-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { StoreContext } from '../../../store';
import { INodeData } from '../../../types';
import { NodeTable } from './NodeTable';

export const SearchNode = observer((props: { isSearch: boolean }) => {
  const store = useContext(StoreContext);

  const [form] = useForm();

  const { currentData, highlightNodes, updateHighlightNodes } = store;

  const [show, setShow] = useState(false);

  const [tableData, setTableData] = useState<INodeData[]>([]);

  const allData = useRef<INodeData[]>([]);

  const selected = useRef<INodeData[]>([]);

  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    allData.current = props.isSearch ? currentData.nodes : highlightNodes;
    setTableData(allData.current);
  }, [currentData, highlightNodes, props.isSearch]);

  useEffect(() => {
    if (show) return;
    selected.current = [];
    handleReset();
  }, [show]);

  function onFinish(values: any) {
    setTableData(
      allData.current.filter(
        (d) =>
          (!values.uid || String(d.uid).includes(String(values.uid))) &&
          (!values.name || String(d.name).includes(String(values.name)))
      )
    );
  }

  function handleReset() {
    setTableData(allData.current);
    form.resetFields();
  }

  function handleSelected(e: INodeData[]) {
    selected.current = e;

    setDisabled(!e?.length);
  }

  function handleSubmitSelected() {
    store.updateSelectedNodes(selected.current.map((d) => d.id as number));
    setShow(false);
  }

  function handleHighlight() {
    updateHighlightNodes(selected.current);
  }
  return (
    <>
      <Button type="primary" onClick={() => setShow(true)}>
        {props.isSearch ? '搜索' : '已记录'}
      </Button>

      <Modal
        width={'80vw'}
        title="节点列表"
        visible={show}
        footer={null}
        getContainer={false}
        afterClose={() => setShow(false)}
        onCancel={() => setShow(false)}
        destroyOnClose
      >
        <div className="flex mb-4 justify-between">
          <Form form={form} layout="inline" onFinish={onFinish}>
            <Form.Item name="uid" label="uid">
              <Input placeholder="请输入id" />
            </Form.Item>
            <Form.Item name="name" label="名称">
              <Input placeholder="请输入节点名称" />
            </Form.Item>

            <Form.Item shouldUpdate>
              {() => (
                <Space>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>{' '}
                  <Button onClick={handleReset}>重置</Button>
                </Space>
              )}
            </Form.Item>
          </Form>

          <Space>
            <Button type="primary" disabled={disabled} onClick={handleSubmitSelected}>
              选中
            </Button>
            {props.isSearch ? (
              <Button type="default" disabled={disabled} onClick={handleHighlight}>
                标记
              </Button>
            ) : null}
          </Space>
        </div>

        <NodeTable<INodeData> data={tableData} onSelected={handleSelected} />
      </Modal>
    </>
  );
});
