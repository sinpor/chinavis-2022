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
import { ILinkData, INodeData, NodeTypeNames, LinkTypeNames } from '../../../types';
import { observer } from 'mobx-react';
import { StoreContext } from '../../../store';
import { request } from '../../../utils/request/request';
import { reaction } from 'mobx';

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

const colors = d3.schemeTableau10;

const linkColors = d3.schemePastel1;

const nodeColorScale = d3.scaleOrdinal(nodeTypes, colors);

const linkColorScale = d3.scaleOrdinal(linkTypes, linkColors);

export const Force: React.FC = observer(() => {
  const store = useContext(StoreContext);

  const { currentData, selectedNodes, updateSelectedNodes } = store;

  const selectedNodesRef = useRef<number[] | null>([]);

  selectedNodesRef.current = selectedNodes;

  const containerRef = useRef<HTMLDivElement>(null);

  const svg = useRef<Selection<BaseType, any, any, any> | null>();

  const canvasContext = useRef<CanvasRenderingContext2D | null>();

  const simulation = useRef<Simulation<INode, ILink> | null>(null);

  const forceNode = useRef<ForceManyBody<INode>>();

  const forceLink = useRef<ForceLink<INode, ILink>>();

  const nodeSizeScale = useRef(d3.scaleLinear());

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
    svg.current = d3.select(containerRef.current).select('svg.force');

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

    nodeSizeScale.current = nodeSizeScale.current
      .domain(d3.extent(nodes.map((d) => d.originData.weight)) as number[])
      .range([3, 8]);

    return { forceNode, forceLink, simulation };
  }, []);

  const initChart = useCallback(
    (nodes: INode[], links: ILink[]) => {
      simulation.current?.on('tick', ticked);

      const { width, height } = box;

      svg.current?.html('');

      svg.current?.attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

      const globalG = svg.current?.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

      const nodeG = globalG?.append('g');

      //   const dragRect = globalG
      //     ?.append('rect')
      //     .attr('x', -width / 2)
      //     .attr('y', -height / 2)
      //     .attr('width', width)
      //     .attr('height', height)
      //     .attr('fill', 'transparent');

      const canvas = containerRef.current?.querySelector('canvas');
      const context = canvasContext.current || canvas?.getContext('2d');
      canvasContext.current = context as CanvasRenderingContext2D;
      (canvas as HTMLCanvasElement).width = width;
      (canvas as HTMLCanvasElement).height = height;

      //   const width = canvas.width;
      //   const height = canvas.height;

      const selectedG = globalG?.append('g').classed('selectedG', true);

      let selectedCircle: Selection<SVGCircleElement, INode, SVGGElement, any>;

      globalG
        ?.append('g')
        .classed('brushG', true)
        .attr('transform', `translate(${-width / 2}, ${-height / 2})`)
        .call(
          d3
            .brush()
            .filter(() => {
              const node = simulation.current?.find(d3.event.offsetX, d3.event.offsetY, 10) as INode;
              return !node;
            })
            .on('start', () => {
              simulation.current?.stop();
            })
            .on('brush', () => {
              //   console.log(d3.event);
              //   console.log(d3.event);
            })
            .on('end', () => {
              const selection = d3.event.selection;
              if (!selection) {
                simulation.current?.alphaTarget(0.5).restart();
                updateSelectedNodes([]);
                return;
              }

              const useData = nodes
                .filter(
                  (d) =>
                    (d.x as number) >= selection[0][0] - width / 2 &&
                    (d.x as number) <= selection[1][0] - width / 2 &&
                    (d.y as number) >= selection[0][1] - height / 2 &&
                    (d.y as number) <= selection[1][1] - height / 2
                )
                .map((d) => d.originData.id);

              updateSelectedNodes(useData as number[]);
            })
        )
        .on('mousemove', () => {
          const { offsetX, offsetY } = d3.event;
          const data = simulation.current?.find(offsetX - width / 2, offsetY - height / 2, 5);

          if (!data) {
            overlay?.attr('cursor', 'crosshair');

            clearTimeout(timer);
            timer = setTimeout(() => {
              setPopoverData((prev) => {
                return { ...prev, show: false };
              });
            }, 50);
            return;
          }

          overlay?.attr('cursor', 'default');

          setPopoverData({
            x: offsetX,
            y: offsetY,
            show: true,
            data: data.originData,
          });
        })
        .on('click', () => {
          const { offsetX, offsetY } = d3.event;
          const data = simulation.current?.find(offsetX - width / 2, offsetY - height / 2, 5);

          if (data) {
            updateSelectedNodes([data.originData.id as number]);
          }
        });

      const overlay = globalG?.select('g.brushG rect.overlay');

      overlay?.call(
        d3.drag().subject(dragsubject).on('start', dragstarted).on('drag', dragged).on('end', dragended) as any
      );

      const coreData = nodes.filter((d) => d.originData.isCore);

      //   核心节点
      const coreNode = nodeG
        ?.selectAll('use')
        .data(coreData)
        .join('use')
        .attr('xlink:href', '#star')
        .attr('width', 20)
        .attr('height', 20)
        .attr('transform', 'translate(-10, -10)')
        .attr('fill', (d) => nodeColorScale(d.originData.label));

      function ticked() {
        context?.clearRect(0, 0, width, height);
        context?.save();
        context?.translate(width / 2, height / 2);

        links.forEach(drawLink);
        nodes.forEach(drawNode);

        context?.restore();

        coreNode?.attr('x', (d) => d?.x || 0).attr('y', (d) => d?.y || 0);

        selectedCircle?.style('cx', (d) => d.x || 0).style('cy', (d) => d.y || 0);
      }

      function dragsubject(): INode {
        return simulation.current?.find(d3.event.x - width / 2, d3.event.y - height / 2, 10) as INode;
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
        (context as CanvasRenderingContext2D).fillStyle = d.originData.isCore
          ? ' rgba(0,0,0,0)'
          : nodeColorScale(d.originData.label);

        // (context as CanvasRenderingContext2D).strokeStyle = '#f00';
        context?.moveTo((d?.x || 0) + 3, d?.y || 0);
        context?.arc(
          d?.x || 0,
          d?.y || 0,
          d.originData.isCore ? 10 : (nodeSizeScale.current(d.originData.weight) as number),
          0,
          2 * Math.PI
        );
        context?.fill();
        // if (selectedNodesRef.current?.includes(d.originData.id as number)) context?.stroke();
        context?.restore();
      }

      const clear = reaction(
        () => store.selectedNodes,
        (val) => {
          const selecteds = nodes.filter((d) => val?.includes(d.originData.id as number));

          simulation.current?.alphaTarget(0.3).restart;

          selectedCircle = selectedG
            ?.html('')
            .selectAll('circle')
            .data(selecteds)
            .join('circle')
            .attr('fill', 'none')
            .attr('stroke', (d) => nodeColorScale(d.originData.label))
            .attr('stroke-width', 2)
            .attr('cx', (d) => d?.x || null)
            .attr('cy', (d) => d?.y || null)
            .style('r', (d) => (nodeSizeScale.current?.(d.originData.weight) as number) + 2) as any;
        },
        { fireImmediately: true }
      );

      return () => {
        clear();
        simulation.current?.on('tick', null);
        context?.clearRect(0, 0, width, height);
      };
    },
    [box]
  );

  useEffect(() => {
    const { clientWidth, clientHeight } = containerRef.current as HTMLDivElement;

    // const SCALE = 3 / 4;
    // const clientHeight = clientWidth * SCALE;
    setBox({ width: clientWidth, height: clientHeight });
  }, []);

  useEffect(() => {
    if (box.width && currentData.nodes) {
      //   request('/mock/community_1.json', { baseURL: '' }).then((res) => {
      const { nodes, links } = currentData;
      // const { nodes, relations: links } = res.data;

      if (box.width) {
        const useNodes: INode[] = nodes.map((_) => ({
          id: _.id as string,
          originData: _,
        }));
        const useLinks: ILink[] = links.map((d) => ({
          source: d.startId,
          target: d.endId,
          originData: d,
        }));

        const forceAbout = init(useNodes, useLinks);

        simulation.current = forceAbout.simulation;
        forceLink.current = forceAbout.forceLink;
        forceNode.current = forceAbout.forceNode;

        forceNode.current.strength(nodeStrength);

        const clear = initChart(useNodes, useLinks);

        setNodes(useNodes);
        setLinks(useLinks);

        return clear;
      }
      //   });
    }
  }, [box, currentData]);

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
    <div ref={containerRef} className="h-full w-full relative">
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
      <div className="p-4 bottom-0 left-0 absolute">
        <div className="font-medium mb-4 text-gray-500">节点图例</div>
        <div className=" grid gap-y-2">
          {nodeTypes.map((n) => (
            <div key={n} className="flex text-xs items-center">
              <span
                className=" rounded-1 h-10px mr-2 w-10px inline-block"
                style={{ backgroundColor: nodeColorScale(n) }}
              ></span>
              <span>{(NodeTypeNames as any)[n]}</span>
            </div>
          ))}
          <div className="flex text-xs items-center">
            <span className=" rounded-1  mr-2 text-red-400 text-10px inline-block">
              <svg viewBox="0 0 1024 1024" width="1em" height="1em">
                <use xlinkHref="#star" fill="currentColor"></use>
              </svg>
            </span>
            <span>核心节点</span>
          </div>
        </div>
      </div>
      <div className="text-right p-4 right-0 bottom-0 absolute">
        <div className="font-medium mb-4 text-gray-500">连线图例</div>
        <div className="grid text-2xs gap-y-2">
          {linkTypes.map((l) => (
            <div key={l} className="flex text-xs items-center justify-between">
              <span>{(LinkTypeNames as any)[l]}</span>
              <span className=" h-3px ml-2 w-30px inline-block" style={{ backgroundColor: linkColorScale(l) }}></span>
            </div>
          ))}
        </div>
      </div>
      <canvas className="h-full w-full z-0 absolute" />
      <svg
        className="z-10 force relative"
        width={`${box.width}px`}
        height={`${box.height}px`}
        viewBox={`0 0 ${box.width} ${box.height}`}
      ></svg>
      <svg className="hidden absolute">
        <defs>
          <symbol id="star" viewBox="0 0 576 512">
            <path
              fill="inherit"
              stroke="black"
              strokeWidth="0.5px"
              d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"
            />
          </symbol>
          <symbol id="wave" viewBox="0 0 1024 1024">
            <circle className="rp1" cx="100" cy="100" r="35" stroke="red" strokeWidth="2" fill="transparent" />
            <circle className="rp2" cx="100" cy="100" r="45" stroke="red" strokeWidth="2" fill="transparent" />
            <circle className="rp3" cx="100" cy="100" r="55" stroke="red" strokeWidth="2" fill="transparent" />
          </symbol>
        </defs>
      </svg>
    </div>
  );
});
