import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Selection,
  BaseType,
  SimulationNodeDatum,
  Simulation,
  SimulationLinkDatum,
  ForceManyBody,
  ForceLink,
} from 'd3';
import { Slider } from 'antd';
import { NodePopover } from './NodePopover';
import { ILinkData, INodeData } from '../../../types';
import { observer } from 'mobx-react';
import { StoreContext } from '../../../store';

const linkTypes = [
  'r_cert',
  'r_subdomain',
  'r_request_jump',
  'r_dns_a',
  'r_whois_name',
  'r_whois_email',
  'r_whois_phone',
  'r_cert_chain',
  'r_cname',
  'r_asn',
  'r_cidr',
];

const nodeTypes = ['Domain', 'IP', 'Cert', 'Whois_Name', 'Whois_Phone', 'Whois_Email', 'IP_C', 'ASN'];

interface INode extends SimulationNodeDatum {
  id: string;
  originData: INodeData;
}

interface ILink extends SimulationLinkDatum<INode> {
  originData: ILinkData;
}

let timer = 0;

export const Force: React.FC = observer(() => {
  const { initData } = useContext(StoreContext);

  const containerRef = useRef<HTMLDivElement>(null);

  const svg = useRef<Selection<BaseType, any, any, any> | null>();

  const simulation = useRef<Simulation<any, any> | null>(null);

  const forceNode = useRef<ForceManyBody<INode>>();

  const forceLink = useRef<ForceLink<INode, ILink>>();

  const [box, setBox] = useState({ width: 0, height: 0 });

  const [nodes, setNodes] = useState<INode[]>([]);

  const [links, setLinks] = useState<ILink[]>([]);

  const [nodeStrength, setNodeStrength] = useState(-5);

  const [popoverData, setPopoverData] = useState<{ x: number; y: number; data: INodeData; show: boolean }>({
    show: false,
    x: 0,
    y: 0,
    data: {} as INodeData,
  });

  const init = useCallback((nodes: INode[], links: ILink[]) => {
    svg.current = d3.select(containerRef.current).select('svg');

    const forceNode = d3.forceManyBody<INode>();
    const forceLink = d3.forceLink<INode, ILink>(links).id((d) => d.id);

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', forceLink)
      .force('charge', forceNode)
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .alphaDecay(0.01);
    //   .velocityDecay(0.3);

    return { forceNode, forceLink, simulation };
  }, []);

  const initChart = useCallback(
    (nodes: INode[], links: ILink[]) => {
      const colors = d3.schemeTableau10;

      const linkColors = d3.schemePastel1;

      const nodeColorScale = d3.scaleOrdinal(nodeTypes, colors);

      const linkColorScale = d3.scaleOrdinal(linkTypes, linkColors);

      simulation.current?.on('tick', ticked);

      const { width, height } = box;

      svg.current?.html('');

      svg.current?.attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

      const globalG = svg.current?.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

      const dragRect = globalG
        ?.append('rect')
        .attr('x', -width / 2)
        .attr('y', -height / 2)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'transparent');

      const canvas = containerRef.current?.querySelector('canvas');
      const context = canvas?.getContext('2d');
      (canvas as HTMLCanvasElement).width = width;
      (canvas as HTMLCanvasElement).height = height;

      //   const width = canvas.width;
      //   const height = canvas.height;

      dragRect
        ?.call(
          d3
            .drag()
            //   .container(dragRect?.node() as SVGRectElement)
            .subject(dragsubject)
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended) as any
        )
        .on('mousemove', () => {
          const { offsetX, offsetY } = d3.event;
          const data = simulation.current?.find(offsetX - width / 2, offsetY - height / 2, 5);

          if (!data) {
            clearTimeout(timer);
            timer = setTimeout(() => {
              setPopoverData((prev) => {
                return { ...prev, show: false };
              });
            }, 50);
            return;
          }

          setPopoverData({
            x: offsetX,
            y: offsetY,
            show: true,
            data: data.originData,
          });
        });

      function ticked() {
        // link
        //   ?.attr('x1', (d) => (d.source as INode).x || '')
        //   .attr('y1', (d) => (d.source as INode)?.y || '')
        //   .attr('x2', (d) => (d.target as INode)?.x || '')
        //   .attr('y2', (d) => (d.target as INode)?.y || '');

        // node?.attr('cx', (d) => d.x || '').attr('cy', (d) => d.y || '');
        context?.clearRect(0, 0, width, height);
        context?.save();
        context?.translate(width / 2, height / 2);

        links.forEach(drawLink);
        nodes.forEach(drawNode);

        context?.restore();
      }

      function dragsubject(): INode {
        return simulation.current?.find(d3.event.x, d3.event.y);
      }

      function dragstarted() {
        if (!d3.event.active) simulation.current?.alphaTarget(0.3).restart();
        d3.event.subject.fx = d3.event.subject.x;
        d3.event.subject.fy = d3.event.subject.y;
      }

      function dragged() {
        d3.event.subject.fx = d3.event.x;
        d3.event.subject.fy = d3.event.y;
      }

      function dragended() {
        if (!d3.event.active) simulation.current?.alphaTarget(0);
        d3.event.subject.fx = null;
        d3.event.subject.fy = null;
      }

      function drawLink(d: ILink) {
        context?.beginPath();
        context?.save();
        (context as CanvasRenderingContext2D).strokeStyle = linkColorScale(d.originData.type);
        context?.moveTo((d.source as INode).x || 0, (d.source as INode).y || 0);
        context?.lineTo((d.target as INode).x || 0, (d.target as INode).y || 0);
        context?.stroke();
        context?.restore();
      }

      function drawNode(d: INode) {
        context?.beginPath();
        context?.save();
        (context as CanvasRenderingContext2D).fillStyle = nodeColorScale(d.originData.label);
        context?.moveTo((d?.x || 0) + 3, d?.y || 0);
        context?.arc(d?.x || 0, d?.y || 0, 3, 0, 2 * Math.PI);
        context?.fill();
        context?.restore();
      }
    },
    [box]
  );

  useEffect(() => {
    const { clientWidth } = containerRef.current as HTMLDivElement;

    const SCALE = 3 / 4;
    const clientHeight = clientWidth * SCALE;
    setBox({ width: clientWidth, height: clientHeight });
  }, []);

  useEffect(() => {
    if (box.width && initData?.nodes) {
      //   request('/mock/community_1.json').then((res) => {

      const { nodes, links } = initData;

      if (box.width) {
        const useNodes: INode[] = nodes.map((_: INodeData) => ({
          id: _.id,
          originData: { ..._, industry: Array.isArray(_.industry) ? _.industry : JSON.parse(_.industry) },
        }));
        const useLinks: ILink[] = links.map((d: ILinkData) => ({
          source: d.startId,
          target: d.endId,
          originData: d,
        }));

        const forceAbout = init(useNodes, useLinks);

        simulation.current = forceAbout.simulation;
        forceLink.current = forceAbout.forceLink;
        forceNode.current = forceAbout.forceNode;

        forceNode.current.strength(nodeStrength);

        initChart(useNodes, useLinks);

        setNodes(useNodes);
        setLinks(useLinks);
      }
      //   });
    }
  }, [box, initData]);

  function handleChangeStrength(val: number) {
    simulation.current?.stop();
    setNodeStrength(val);
    forceNode.current?.strength(val);
    simulation.current?.alphaTarget(0.5).restart();
  }

  function handleChangeShow(show: boolean) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      setPopoverData((prev) => {
        return { ...prev, show };
      });
    }, 100);
  }

  return (
    <div ref={containerRef} className="w-full relative">
      {popoverData.show ? (
        <NodePopover
          x={popoverData.x}
          y={popoverData.y}
          nodeData={popoverData.data}
          show={popoverData.show}
          onChangeShow={handleChangeShow}
        />
      ) : null}
      <div className="right-0 w-200px z-20 absolute">
        <div className="text-gray-500">节点力</div>
        <Slider min={-20} max={-2} value={nodeStrength} onChange={handleChangeStrength} />
      </div>
      <canvas className="h-full w-full z-0 absolute" />
      <svg
        className="z-10 relative"
        width={`${box.width}px`}
        height={`${box.height}px`}
        viewBox={`0 0 ${box.width} ${box.height}`}
      ></svg>
    </div>
  );
});
