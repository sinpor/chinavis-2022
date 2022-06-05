import React, { useCallback, useEffect, useRef, useState } from 'react';
import { request } from '../../../utils/request/request';
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
import { Button } from 'antd';

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
  originData: any;
}

interface ILink extends SimulationLinkDatum<INode> {
  originData: any;
}

export const Force: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const svg = useRef<Selection<BaseType, any, any, any> | null>();

  const simulation = useRef<Simulation<any, any> | null>(null);

  const forceNode = useRef<ForceManyBody<INode>>();

  const forceLink = useRef<ForceLink<INode, ILink>>();

  const [box, setBox] = useState({ width: 0, height: 0 });

  const [nodes, setNodes] = useState<INode[]>([]);

  const [links, setLinks] = useState<ILink[]>([]);

  const init = useCallback((nodes: INode[], links: ILink[]) => {
    svg.current = d3.select(containerRef.current).select('svg');

    const forceNode = d3.forceManyBody<INode>();
    const forceLink = d3.forceLink<INode, ILink>(links).id((d) => d.id);

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', forceLink)
      .force('charge', forceNode)
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    return { forceNode, forceLink, simulation };
  }, []);

  const initChart = useCallback(
    (nodes: INode[], links: ILink[]) => {
      const colors = d3.schemeTableau10;

      const linkColors = d3.schemePastel1;

      const linkStrokeWidth = 1.5;
      // node stroke fill (if not using a group color encoding)
      const nodeFill = 'currentColor';
      // node stroke color
      const nodeStroke = '#fff';
      // node stroke width, in pixels
      const nodeStrokeWidth = 1.5;
      // node stroke opacity
      const nodeStrokeOpacity = 1;
      // node radius, in pixels
      const nodeRadius = 5;

      // link stroke opacity
      const linkStrokeOpacity = 0.6;
      // link stroke linecap
      const linkStrokeLinecap = 'round';

      //   const nodeStrength = null;

      //   const linkStrength = 1;

      // link stroke color

      const nodeColorScale = d3.scaleOrdinal(nodeTypes, colors);

      function linkStroke(d: any): any {
        return d3.scaleOrdinal().domain(linkTypes).range(linkColors)(d.type);
      }

      //   function nodeId(d: any) {
      //     return d.id;
      //   }

      //   function intern(value: any) {
      //     return value !== null && typeof value === 'object' ? value.valueOf() : value;
      //   }

      //   const linkSource = ({ startId: source }: any) => source;
      //   const linkTarget = ({ endId: target }: any) => target;

      //   const nodeTitle = (d: any) => `${d.id} (${d.group})`;

      //   const nodeGroup = (d: any) => d.group;

      //   let nodeGroups: any;

      //   const N = nodes.map(nodeId).map(intern);
      //   const LS = links.map(linkSource).map(intern);
      //   const LT = links.map(linkTarget).map(intern);
      // if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
      //   const T = nodeTitle == null ? null : nodes.map(nodeTitle);
      //   const G = nodeGroup == null ? null : nodes.map(nodeGroup).map(intern);
      //   const W = typeof linkStrokeWidth !== 'function' ? null : links.map(linkStrokeWidth);

      // Compute default domains.
      //   if (G) nodeGroups = G.sort();

      // Construct the scales.

      simulation.current?.on('tick', ticked);

      const { width, height } = box;

      svg.current?.html('');

      svg.current?.attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

      const globalG = svg.current?.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

      const link = globalG
        ?.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', linkStrokeOpacity)
        .attr('stroke-width', linkStrokeWidth)
        .attr('stroke-linecap', linkStrokeLinecap)
        .selectAll('line')
        .data(links)
        .join('line');

      link?.attr('stroke', linkStroke);

      link?.attr('title', (d) => d.originData.type);

      const node = globalG
        ?.append('g')
        .attr('fill', nodeFill)
        .attr('stroke', nodeStroke)
        .attr('stroke-opacity', nodeStrokeOpacity)
        .attr('stroke-width', nodeStrokeWidth)
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', nodeRadius)
        .call(drag() as any);

      node?.attr('fill', (d) => nodeColorScale(d.originData.label));
      node?.append('title').text((d) => d.originData.name);

      // Handle invalidation.
      // if (invalidation != null) invalidation.then(() => simulation.stop());

      function ticked() {
        link
          ?.attr('x1', (d) => (d.source as INode).x || '')
          .attr('y1', (d) => (d.source as INode)?.y || '')
          .attr('x2', (d) => (d.target as INode)?.x || '')
          .attr('y2', (d) => (d.target as INode)?.y || '');

        node?.attr('cx', (d) => d.x || '').attr('cy', (d) => d.y || '');
      }

      function drag() {
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

        return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
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
    if (box.width) {
      request('/mock/community_1.json').then((res) => {
        const { nodes, relations: links } = res.data;

        if (box.width) {
          const useNodes: INode[] = nodes.map((_: any) => ({ id: _.id, originData: _ }));
          const useLinks: ILink[] = links.map((d: any) => ({
            source: d.startId,
            target: d.endId,
            originData: d,
          }));

          const forceAbout = init(useNodes, useLinks);

          simulation.current = forceAbout.simulation;
          forceLink.current = forceAbout.forceLink;
          forceNode.current = forceAbout.forceNode;

          initChart(useNodes, useLinks);

          setNodes(useNodes);
          setLinks(useLinks);
        }
      });
    }
  }, [box]);

  function handleClick() {
    simulation.current?.stop();
    forceNode.current?.strength((forceNode.current?.strength as unknown as number) - 1);
    simulation.current?.restart();
  }

  return (
    <div ref={containerRef} className="w-full relative">
      <div className="absolute">
        <Button type="primary" onClick={handleClick}>
          -1
        </Button>
      </div>
      <svg width={`${box.width}px`} height={`${box.height}px`} viewBox={`0 0 ${box.width} ${box.height}`}></svg>
    </div>
  );
};
