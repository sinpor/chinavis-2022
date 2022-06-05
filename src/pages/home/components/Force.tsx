import React, { useCallback, useEffect, useRef, useState } from 'react';
import { request } from '../../../utils/request/request';
import * as d3 from 'd3';
import { Selection, BaseType } from 'd3';

export const Force: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const svg = useRef<Selection<BaseType, any, any, any> | null>();

  const [box, setBox] = useState({ width: 0, height: 0 });

  const init = useCallback(() => {
    svg.current = d3.select(containerRef.current).select('svg');
  }, []);

  const initChart = useCallback(
    (nodes: any[], links: any[]) => {
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

      // link stroke color
      const linkStroke = '#999';
      // link stroke opacity
      const linkStrokeOpacity = 0.6;
      // link stroke linecap
      const linkStrokeLinecap = 'round';

      const nodeStrength = null;

      const linkStrength = 1;

      const colors = d3.schemeTableau10;

      function nodeId(d: any) {
        return d.id;
      }

      function intern(value: any) {
        return value !== null && typeof value === 'object' ? value.valueOf() : value;
      }

      const linkSource = ({ source }: any) => source;
      const linkTarget = ({ target }: any) => target;

      const nodeTitle = (d: any) => `${d.id} (${d.group})`;

      const nodeGroup = (d: any) => d.group;

      let nodeGroups: any;

      const N = nodes.map(nodeId).map(intern);
      const LS = links.map(linkSource).map(intern);
      const LT = links.map(linkTarget).map(intern);
      // if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
      const T = nodeTitle == null ? null : nodes.map(nodeTitle);
      const G = nodeGroup == null ? null : nodes.map(nodeGroup).map(intern);
      const W = typeof linkStrokeWidth !== 'function' ? null : links.map(linkStrokeWidth);

      // Replace the input nodes and links with mutable objects for the simulation.
      nodes = nodes.map((_, i) => ({ id: N[i] }));
      links = links.map((_, i) => ({ source: LS[i], target: LT[i] }));

      // Compute default domains.
      if (G) nodeGroups = G.sort();

      // Construct the scales.
      const color = nodeGroup == null ? (d: any) => d : d3.scaleOrdinal(nodeGroups, colors);

      // Construct the forces.
      const forceNode = d3.forceManyBody();
      const forceLink = d3.forceLink(links).id(({ index: i }) => N[i as any]);
      if (nodeStrength !== null) forceNode.strength(nodeStrength);
      if (linkStrength !== null) forceLink.strength(linkStrength);

      const simulation = d3
        .forceSimulation(nodes)
        .force('link', forceLink)
        .force('charge', forceNode)
        .force('x', d3.forceX())
        .force('y', d3.forceY())
        .on('tick', ticked);

      const { width, height } = box;

      svg.current?.html('');

      svg.current?.attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

      const globalG = svg.current?.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

      const link = globalG
        ?.append('g')
        .attr('stroke', linkStroke)
        .attr('stroke-opacity', linkStrokeOpacity)
        .attr('stroke-width', typeof linkStrokeWidth !== 'function' ? linkStrokeWidth : '')
        .attr('stroke-linecap', linkStrokeLinecap)
        .selectAll('line')
        .data(links)
        .join('line');

      if (W) link?.attr('stroke-width', ({ index: i }: any): any => W[i]);

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
        .call(drag(simulation) as any);

      if (G) node?.attr('fill', ({ index: i }) => color(G[i] || ''));
      if (T) node?.append('title').text(({ index: i }) => T[i]);

      // Handle invalidation.
      // if (invalidation != null) invalidation.then(() => simulation.stop());

      function ticked() {
        link
          ?.attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y);

        node?.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      }

      function drag(simulation: any) {
        function dragstarted() {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          d3.event.subject.fx = d3.event.subject.x;
          d3.event.subject.fy = d3.event.subject.y;
        }

        function dragged() {
          d3.event.subject.fx = d3.event.x;
          d3.event.subject.fy = d3.event.y;
        }

        function dragended() {
          if (!d3.event.active) simulation.alphaTarget(0);
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
      request('/mock/test-force.json').then((res) => {
        const { nodes, links } = res.data;
        console.log(box.width);

        if (box.width) {
          init();
          initChart(nodes, links);
        }
      });
    }
  }, [box]);

  return (
    <div ref={containerRef} className="w-full">
      <svg width={`${box.width}px`} height={`${box.height}px`} viewBox={`0 0 ${box.width} ${box.height}`}></svg>
    </div>
  );
};
