import { ExportOutlined } from '@ant-design/icons';
import { Button, Modal, Tooltip } from 'antd';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '../../../store';
import { Parser } from 'json2csv';
import JSZip from 'jszip';
import { toJS } from 'mobx';

export const Export = observer(() => {
  const { currentData, curCommunity } = useContext(StoreContext);

  function download(content: Blob, filename: string) {
    // 创建隐藏的可下载链接
    const eleLink = document.createElement('a');
    eleLink.download = filename;
    // 字符内容转变成blob地址
    eleLink.href = URL.createObjectURL(content);
    // 触发点击
    eleLink.click();

    URL.revokeObjectURL(eleLink.href);
  }

  function handleExport() {
    Modal.confirm({
      title: '导出社区',
      okText: '导出',
      okButtonProps: {
        disabled: !currentData?.nodes?.length,
      },
      onOk: () => {
        return new Promise((resolve, reject) => {
          try {
            const nodeCsv = new Parser({
              fields: Object.keys(currentData.nodes[0]),
              eol: '\n',
              unwind: { paths: ['fieldToUnwind'], blankOut: true },
            }).parse(currentData.nodes);

            const linkCsv = new Parser({
              fields: Object.keys(currentData.links[0]),
              eol: '\n',
              unwind: { paths: ['fieldToUnwind'], blankOut: true },
            }).parse(currentData.links);

            const zip = new JSZip();

            const folder = zip.folder(String(curCommunity));

            folder?.file('nodes.csv', nodeCsv);
            folder?.file('links.csv', linkCsv);

            zip
              .generateAsync({ type: 'blob' })
              .then(function (content) {
                download(content, `${curCommunity}.zip`);
                resolve(true);
              })
              .catch((e) => reject(e));
          } catch (e) {
            reject(e);
          }
        });
      },
    });
  }
  return (
    <Tooltip title="导出社区">
      <Button type="link" icon={<ExportOutlined />} onClick={handleExport}></Button>
    </Tooltip>
  );
});
