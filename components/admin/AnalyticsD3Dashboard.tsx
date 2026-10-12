'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import GlassCard from '@/components/ui/GlassCard';
import { StudioAudio } from '@/lib/watermark';
import { Activity, Calendar, Zap, Sparkles } from 'lucide-react';

export type TimeframeMode = '7d' | '30d' | 'live';

interface TrafficDataPoint {
  date: Date;
  label: string;
  visitors: number;
  requests: number;
  cacheHits: number;
}

interface ModuleDataPoint {
  module: string;
  count: number;
  avgDuration: string;
  color: string;
}

// Traffic/module data is fetched from GET /api/admin/analytics — real counters
// measured by the API process. Nothing here is synthesized.

export const AnalyticsD3Dashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframeMode>('live');
  const lineChartRef = useRef<SVGSVGElement>(null);
  const barChartRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<TrafficDataPoint | null>(null);
  const [hoveredBar, setHoveredBar] = useState<ModuleDataPoint | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficDataPoint[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const lastCountsRef = useRef<{ requests: number; errors: number } | null>(null);

  const pollTelemetry = React.useCallback(async (pushPoint: boolean) => {
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || 'load failed');
      setAnalytics(data);
      setLoadError(null);

      if (pushPoint) {
        const t = data.telemetry;
        const prev = lastCountsRef.current;
        lastCountsRef.current = { requests: t.requests, errors: t.errors5xx };
        const now = new Date();
        const label = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const point: TrafficDataPoint = {
          date: now,
          label,
          visitors: prev ? Math.max(0, t.requests - prev.requests) : 0,
          requests: prev ? Math.max(0, t.errors5xx - prev.errors) : 0,
          cacheHits: t.requests,
        };
        setTrafficData((prevPoints) => [...prevPoints.slice(11), point]);
      }
    } catch {
      setLoadError('Could not reach /api/admin/analytics — live counters unavailable.');
    }
  }, []);

  // Reset + load on timeframe change; poll continuously only in live mode.
  useEffect(() => {
    lastCountsRef.current = null;
    if (timeframe === 'live') {
      setTrafficData([]);
      pollTelemetry(true);
      const interval = setInterval(() => pollTelemetry(true), 2500);
      return () => clearInterval(interval);
    }
    // 7d / 30d: no history store is connected — show an honest empty state.
    setTrafficData([]);
    pollTelemetry(false);
  }, [timeframe, pollTelemetry]);

  // 1. Render D3 Line Chart
  useEffect(() => {
    if (!lineChartRef.current || trafficData.length === 0) return;

    const svg = d3.select(lineChartRef.current);
    svg.selectAll('*').remove();

    const width = 640;
    const height = 280;
    const margin = { top: 25, right: 30, bottom: 35, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Gradient definitions
    const defs = svg.append('defs');

    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'gold-area-gradient')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#C9A84C')
      .attr('stop-opacity', 0.35);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#C9A84C')
      .attr('stop-opacity', 0.0);

    // X and Y scales
    const xScale = d3
      .scalePoint<string>()
      .domain(trafficData.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.2);

    const maxY = d3.max(trafficData, (d) => Math.max(d.visitors, d.requests)) || 1000;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxY * 1.15])
      .nice()
      .range([innerHeight, 0]);

    // Horizontal Grid Lines
    const yAxisGrid = d3
      .axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat(() => '')
      .ticks(5);

    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', 'rgba(138, 110, 42, 0.15)')
      .attr('stroke-dasharray', '3 3');

    g.select('.grid .domain').remove();

    // Line generator for Requests
    const lineRequests = d3
      .line<TrafficDataPoint>()
      .x((d) => xScale(d.label) || 0)
      .y((d) => yScale(d.requests))
      .curve(d3.curveMonotoneX);

    // Line and Area generator for Visitors
    const lineVisitors = d3
      .line<TrafficDataPoint>()
      .x((d) => xScale(d.label) || 0)
      .y((d) => yScale(d.visitors))
      .curve(d3.curveMonotoneX);

    const areaVisitors = d3
      .area<TrafficDataPoint>()
      .x((d) => xScale(d.label) || 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.visitors))
      .curve(d3.curveMonotoneX);

    // Draw Area under visitors
    g.append('path')
      .datum(trafficData)
      .attr('fill', 'url(#gold-area-gradient)')
      .attr('d', areaVisitors);

    // Draw Line: Requests (dimmed amber)
    g.append('path')
      .datum(trafficData)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(232, 201, 106, 0.4)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 4')
      .attr('d', lineRequests);

    // Draw Line: Visitors (vibrant gold)
    g.append('path')
      .datum(trafficData)
      .attr('fill', 'none')
      .attr('stroke', '#C9A84C')
      .attr('stroke-width', 2.5)
      .attr('d', lineVisitors);

    // Interactive circles
    const dots = g
      .selectAll('.dot')
      .data(trafficData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.label) || 0)
      .attr('cy', (d) => yScale(d.visitors))
      .attr('r', 4)
      .attr('fill', '#050404')
      .attr('stroke', '#C9A84C')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event: MouseEvent, d: TrafficDataPoint) {
        setHoveredPoint(d);
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 7)
          .attr('fill', '#C9A84C');
      })
      .on('mouseleave', function () {
        setHoveredPoint(null);
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 4)
          .attr('fill', '#050404');
      });

    // X Axis
    const xAxis = d3.axisBottom(xScale).tickSize(0);
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight + 8})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#8a6e2a')
      .attr('font-family', 'var(--font-mono)')
      .attr('font-size', '10px');

    g.select('.domain').attr('stroke', 'rgba(138, 110, 42, 0.25)');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => (Number(d) >= 1000 ? `${(Number(d) / 1000).toFixed(1)}k` : `${d}`));

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#8a6e2a')
      .attr('font-family', 'var(--font-mono)')
      .attr('font-size', '10px');

    g.selectAll('.domain').attr('stroke', 'rgba(138, 110, 42, 0.25)');
  }, [trafficData]);

  // 2. Render D3 Bar Chart for Module Engagement
  useEffect(() => {
    if (!barChartRef.current) return;

    const svg = d3.select(barChartRef.current);
    svg.selectAll('*').remove();

    // Real top-route counters since server boot (measured, not simulated).
    const data: ModuleDataPoint[] = (analytics?.telemetry?.topPaths || [])
      .slice(0, 7)
      .map((p: any, i: number) => ({
        module: p.path.length > 22 ? `${p.path.slice(0, 21)}…` : p.path,
        count: p.count,
        avgDuration: 'since boot',
        color: ['#C9A84C', '#e8c96a', '#8b2e24', '#7a7268', '#b8941e', '#6b5520', '#8a6e2a'][i % 7],
      }));
    if (data.length === 0) return;
    const width = 480;
    const height = 280;
    const margin = { top: 25, right: 20, bottom: 35, left: 105 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.module))
      .range([0, innerHeight])
      .padding(0.28);

    const maxVal = d3.max(data, (d) => d.count) || 100;
    const xScale = d3
      .scaleLinear()
      .domain([0, maxVal * 1.1])
      .nice()
      .range([0, innerWidth]);

    // Horizontal bars
    g.selectAll('.bar-bg')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar-bg')
      .attr('y', (d) => yScale(d.module) || 0)
      .attr('height', yScale.bandwidth())
      .attr('x', 0)
      .attr('width', innerWidth)
      .attr('rx', 4)
      .attr('fill', 'rgba(201, 168, 76, 0.05)');

    const bars = g
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => yScale(d.module) || 0)
      .attr('height', yScale.bandwidth())
      .attr('x', 0)
      .attr('width', 0)
      .attr('rx', 4)
      .attr('fill', (d) => d.color)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event: MouseEvent, d: ModuleDataPoint) {
        setHoveredBar(d);
        d3.select(this).attr('filter', 'brightness(1.25)');
      })
      .on('mouseleave', function () {
        setHoveredBar(null);
        d3.select(this).attr('filter', 'none');
      });

    // Animate bars on load/switch
    bars
      .transition()
      .duration(600)
      .attr('width', (d) => xScale(d.count));

    // Value labels
    g.selectAll('.val-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'val-label')
      .attr('y', (d) => (yScale(d.module) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('x', (d) => xScale(d.count) + 8)
      .attr('fill', '#f5f3f0')
      .attr('font-family', 'var(--font-mono)')
      .attr('font-size', '10px')
      .text((d) => (d.count >= 1000 ? `${(d.count / 1000).toFixed(1)}k` : `${d.count}`));

    // Y Axis labels (module names)
    const yAxis = d3.axisLeft(yScale).tickSize(0);
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#c4c0bb')
      .attr('font-family', 'var(--font-display)')
      .attr('font-size', '11px');

    g.select('.domain').remove();
  }, [analytics]);

  const handleTimeframeChange = (mode: TimeframeMode) => {
    StudioAudio.playClick();
    setTimeframe(mode);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Timeframe Interactive Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[rgba(201,168,76,0.15)] border border-[#C9A84C] flex items-center justify-center text-[#e8c96a]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-[#f5f3f0]">
              Telemetry & Module Vector
            </h3>
            <p className="text-[11px] font-mono text-[#8a6e2a]">
              Real request counters measured by the API server (since boot).
            </p>
          </div>
        </div>

        {/* 3-Way Toggle Button Group */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)]">
          <button
            type="button"
            onClick={() => handleTimeframeChange('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              timeframe === '7d'
                ? 'bg-[#8a6e2a] text-[#faf7f2] shadow-[0_2px_12px_rgba(201,168,76,0.3)]'
                : 'text-[#8a857e] hover:text-[#f5f3f0]'
            }`}
          >
            7-Day
          </button>

          <button
            type="button"
            onClick={() => handleTimeframeChange('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              timeframe === '30d'
                ? 'bg-[#8a6e2a] text-[#faf7f2] shadow-[0_2px_12px_rgba(201,168,76,0.3)]'
                : 'text-[#8a857e] hover:text-[#f5f3f0]'
            }`}
          >
            30-Day
          </button>

          <button
            type="button"
            onClick={() => handleTimeframeChange('live')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              timeframe === 'live'
                ? 'bg-[#8b2e24] text-[#faf7f2] shadow-[0_2px_12px_rgba(192,57,43,0.3)]'
                : 'text-[#8a857e] hover:text-[#f5f3f0]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                timeframe === 'live' ? 'bg-red-400 animate-pulse' : 'bg-[#8a857e]'
              }`}
            />
            <span>Live Telemetry</span>
          </button>
        </div>
      </div>

      {/* D3 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart: Traffic Velocity */}
        <GlassCard className="lg:col-span-7 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C]">
                Vector 01 // D3 Line Topology
              </span>
              <h4 className="font-display font-bold text-base text-[#f5f3f0]">
                {timeframe === 'live'
                  ? 'Live Server Requests (2.5s Windows)'
                  : 'Historical Telemetry Not Retained'}
              </h4>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#C9A84C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9A84C]" /> Requests / Window
              </span>
              <span className="flex items-center gap-1.5 text-[#e8c96a]/70">
                <span className="w-2.5 h-1 border-t border-dashed border-[#e8c96a]" /> 5xx Errors
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto relative">
            <svg
              ref={lineChartRef}
              viewBox="0 0 640 280"
              className="w-full h-auto min-w-[500px]"
            />

            {trafficData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-center px-6 pointer-events-none">
                <p className="text-xs font-mono text-[#8a6e2a] max-w-sm leading-relaxed">
                  {loadError ||
                    'No historical log store is connected — 7d/30d history is not collected yet. Switch to Live Telemetry to watch real request traffic as it happens.'}
                </p>
              </div>
            )}

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div className="absolute top-2 right-4 p-3 rounded-xl bg-[#050404]/95 border border-[#C9A84C] text-xs font-mono space-y-1 shadow-xl pointer-events-none">
                <div className="text-[#C9A84C] font-bold">{hoveredPoint.label}</div>
                <div className="text-[#f5f3f0]">Requests: <span className="font-bold">{hoveredPoint.visitors}</span></div>
                <div className="text-[#c4c0bb]">5xx Errors: <span>{hoveredPoint.requests}</span></div>
                <div className="text-emerald-400">Total Since Boot: <span>{hoveredPoint.cacheHits}</span></div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Bar Chart: Module Engagement */}
        <GlassCard className="lg:col-span-5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C]">
                Vector 02 // D3 Module Engagement
              </span>
              <h4 className="font-display font-bold text-base text-[#f5f3f0]">
                Top Routes Since Boot
              </h4>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] text-[#e8c96a]">
              MEASURED
            </span>
          </div>

          <div className="w-full overflow-x-auto relative">
            <svg
              ref={barChartRef}
              viewBox="0 0 480 280"
              className="w-full h-auto min-w-[340px]"
            />

            {analytics && (analytics?.telemetry?.topPaths || []).length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                <p className="text-xs font-mono text-[#8a6e2a]">No requests counted yet since boot.</p>
              </div>
            )}
            {!analytics && loadError && (
              <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                <p className="text-xs font-mono text-[#8a6e2a]">{loadError}</p>
              </div>
            )}

            {/* Bar Hover Tooltip */}
            {hoveredBar && (
              <div className="absolute top-2 right-4 p-2.5 rounded-xl bg-[#050404]/95 border border-[#C9A84C] text-xs font-mono space-y-0.5 shadow-xl pointer-events-none">
                <div className="text-[#C9A84C] font-bold">{hoveredBar.module}</div>
                <div className="text-[#f5f3f0]">Executions: <span className="font-bold">{hoveredBar.count}</span></div>
                <div className="text-[#8a857e]">Avg Duration: <span>{hoveredBar.avgDuration}</span></div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AnalyticsD3Dashboard;
