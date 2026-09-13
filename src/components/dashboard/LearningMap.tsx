import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Info, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { useLearningMap } from '../../hooks/useMockData';
import type { MasteryLevel } from '../../types';

interface NodeStyleConfig {
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
  badgeText: string;
  ring: string;
}

const masteryStyleMap: Record<MasteryLevel, NodeStyleConfig> = {
  mastered: {
    bg: '#ECFDF5',
    border: '#10B981',
    text: '#065F46',
    badgeBg: '#10B981',
    badgeText: '#FFFFFF',
    ring: 'rgba(16, 185, 129, 0.2)',
  },
  proficient: {
    bg: '#EEF2FF',
    border: '#6366F1',
    text: '#3730A3',
    badgeBg: '#6366F1',
    badgeText: '#FFFFFF',
    ring: 'rgba(99, 102, 241, 0.2)',
  },
  developing: {
    bg: '#FFFBEB',
    border: '#F59E0B',
    text: '#92400E',
    badgeBg: '#F59E0B',
    badgeText: '#FFFFFF',
    ring: 'rgba(245, 158, 11, 0.2)',
  },
  'needs-attention': {
    bg: '#FEF2F2',
    border: '#EF4444',
    text: '#991B1B',
    badgeBg: '#EF4444',
    badgeText: '#FFFFFF',
    ring: 'rgba(239, 68, 68, 0.25)',
  },
  novice: {
    bg: '#F8FAFC',
    border: '#CBD5E1',
    text: '#475569',
    badgeBg: '#94A3B8',
    badgeText: '#FFFFFF',
    ring: 'rgba(148, 163, 184, 0.2)',
  },
};

export const LearningMap: React.FC = () => {
  const { nodes, edges } = useLearningMap();
  const navigate = useNavigate();

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Keep the existing visual layout.
  const structuredNodes = [
    {
      id: 'topic-01',
      name: 'ML Fundamentals',
      track: 'Foundation',
      x: 70,
      y: 150,
      level: 'mastered' as MasteryLevel,
      pct: 92,
    },

    {
      id: 'topic-02',
      name: 'Features & Labels',
      track: 'Data Track',
      x: 230,
      y: 70,
      level: 'proficient' as MasteryLevel,
      pct: 85,
    },
    {
      id: 'topic-03',
      name: 'Train / Test Data',
      track: 'Data Track',
      x: 390,
      y: 70,
      level: 'developing' as MasteryLevel,
      pct: 62,
    },
    {
      id: 'topic-12',
      name: 'Overfitting',
      track: 'Data Track',
      x: 550,
      y: 70,
      level: 'needs-attention' as MasteryLevel,
      pct: 51,
      isGap: true,
    },
    {
      id: 'topic-14',
      name: 'Regularization',
      track: 'Data Track',
      x: 710,
      y: 70,
      level: 'novice' as MasteryLevel,
      pct: 20,
    },

    {
      id: 'topic-04',
      name: 'Supervised Learning',
      track: 'Model Track',
      x: 230,
      y: 230,
      level: 'proficient' as MasteryLevel,
      pct: 88,
    },
    {
      id: 'topic-06',
      name: 'Classification',
      track: 'Model Track',
      x: 390,
      y: 230,
      level: 'proficient' as MasteryLevel,
      pct: 78,
    },
    {
      id: 'topic-10',
      name: 'Evaluation Metrics',
      track: 'Model Track',
      x: 550,
      y: 230,
      level: 'proficient' as MasteryLevel,
      pct: 71,
    },
    {
      id: 'topic-11',
      name: 'Confusion Matrix',
      track: 'Model Track',
      x: 710,
      y: 230,
      level: 'developing' as MasteryLevel,
      pct: 40,
    },

    {
      id: 'topic-05',
      name: 'Regression',
      track: 'Branch',
      x: 390,
      y: 330,
      level: 'proficient' as MasteryLevel,
      pct: 74,
    },
    {
      id: 'topic-09',
      name: 'Decision Trees',
      track: 'Branch',
      x: 550,
      y: 330,
      level: 'developing' as MasteryLevel,
      pct: 55,
    },
    {
      id: 'topic-15',
      name: 'Cross Validation',
      track: 'Branch',
      x: 710,
      y: 150,
      level: 'novice' as MasteryLevel,
      pct: 28,
    },
  ];

  const structuredEdges = [
    { from: 'topic-01', to: 'topic-02' },
    { from: 'topic-01', to: 'topic-04' },

    { from: 'topic-02', to: 'topic-03' },
    { from: 'topic-03', to: 'topic-12', highlight: true },
    { from: 'topic-12', to: 'topic-14' },

    { from: 'topic-04', to: 'topic-06' },
    { from: 'topic-06', to: 'topic-10' },
    { from: 'topic-10', to: 'topic-11' },

    { from: 'topic-04', to: 'topic-05' },
    { from: 'topic-06', to: 'topic-09' },
    { from: 'topic-03', to: 'topic-15' },
    { from: 'topic-10', to: 'topic-12' },
  ];

  const hoveredNode = structuredNodes.find(
    (n) => n.id === hoveredNodeId
  );

  const handleNodeClick = (topicId: string) => {
    navigate(`/learn/${topicId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col p-5 bg-white border border-border shadow-card hover:shadow-card-hover transition-shadow duration-300">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-primary">
              <GitBranch className="w-4 h-4 text-primary" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-text-primary tracking-tight">
                Learning Concept Map
              </h2>

              <p className="text-[11px] text-text-secondary">
                Prerequisite relationships & adaptive knowledge pathways
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-accent" />
              12 Concepts Mapped
            </span>
          </div>
        </div>

        {/* Pathway Labels */}
        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 mb-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-indigo-800">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Track 1: Data Partitioning & Generalization</span>
          </div>

          <div className="flex items-center gap-1.5 text-cyan-800">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>Track 2: Supervised Learning & Evaluation</span>
          </div>
        </div>

        {/* Interactive Canvas */}
        <div className="flex-1 w-full overflow-x-auto overflow-y-hidden border border-slate-200/80 rounded-xl bg-gradient-to-b from-slate-50/70 to-white/90 p-2">
          <div
            style={{ minWidth: '820px', height: '380px' }}
            className="relative mx-auto"
          >
            <svg
              viewBox="0 0 820 380"
              className="w-full h-full select-none"
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path
                    d="M 0 1 L 8 5 L 0 9 z"
                    fill="#94A3B8"
                  />
                </marker>

                <marker
                  id="arrow-highlight"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path
                    d="M 0 1 L 8 5 L 0 9 z"
                    fill="#EF4444"
                  />
                </marker>
              </defs>

              {/* Connecting Edges */}
              {structuredEdges.map((edge, i) => {
                const source = structuredNodes.find(
                  (n) => n.id === edge.from
                );

                const target = structuredNodes.find(
                  (n) => n.id === edge.to
                );

                if (!source || !target) return null;

                const isConnectedToHovered =
                  hoveredNodeId &&
                  (source.id === hoveredNodeId ||
                    target.id === hoveredNodeId);

                const midX = (source.x + target.x) / 2;

                const strokeColor = edge.highlight
                  ? '#F87171'
                  : isConnectedToHovered
                  ? '#6366F1'
                  : '#CBD5E1';

                const strokeWidth =
                  edge.highlight || isConnectedToHovered
                    ? 2.5
                    : 1.5;

                const strokeDash = edge.highlight
                  ? '4 3'
                  : undefined;

                return (
                  <path
                    key={`edge-${i}`}
                    d={`M ${source.x + 50} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${target.x - 50} ${target.y}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDash}
                    markerEnd={
                      edge.highlight
                        ? 'url(#arrow-highlight)'
                        : 'url(#arrow)'
                    }
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Interactive Concept Nodes */}
              {structuredNodes.map((node) => {
                const style = masteryStyleMap[node.level];
                const isHovered = hoveredNodeId === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x - 55}, ${node.y - 24})`}
                    onMouseEnter={() =>
                      setHoveredNodeId(node.id)
                    }
                    onMouseLeave={() =>
                      setHoveredNodeId(null)
                    }
                    onClick={() => handleNodeClick(node.id)}
                    className="cursor-pointer transition-transform duration-200"
                    style={{
                      filter: isHovered
                        ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))'
                        : 'drop-shadow(0 1px 2px rgba(0,0,0,0.05))',
                    }}
                  >
                    {/* Node Box */}
                    <rect
                      width="110"
                      height="48"
                      rx="8"
                      fill={style.bg}
                      stroke={style.border}
                      strokeWidth={
                        node.isGap
                          ? '2'
                          : isHovered
                          ? '2'
                          : '1.5'
                      }
                    />

                    {/* Gap Indicator */}
                    {node.isGap && (
                      <circle
                        cx="102"
                        cy="8"
                        r="4"
                        fill="#EF4444"
                        className="animate-ping"
                      />
                    )}

                    {/* Topic Name */}
                    <text
                      x="10"
                      y="20"
                      fill={style.text}
                      fontSize="10.5"
                      fontWeight="700"
                      fontFamily="Inter, sans-serif"
                    >
                      {node.name.length > 15
                        ? node.name.substring(0, 14) + '…'
                        : node.name}
                    </text>

                    {/* Mastery */}
                    <g transform="translate(10, 27)">
                      <rect
                        width="36"
                        height="14"
                        rx="3"
                        fill={style.badgeBg}
                      />

                      <text
                        x="18"
                        y="10.5"
                        fill={style.badgeText}
                        fontSize="8.5"
                        fontWeight="700"
                        textAnchor="middle"
                        fontFamily="Inter, sans-serif"
                      >
                        {node.pct}%
                      </text>

                      <text
                        x="42"
                        y="10.5"
                        fill={style.text}
                        fontSize="8"
                        fontWeight="600"
                        fontFamily="Inter, sans-serif"
                      >
                        {node.level.replace('-', ' ')}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100 text-xs">

          {hoveredNode ? (
            <div className="flex items-center gap-2 text-text-primary font-medium">
              <Info className="w-3.5 h-3.5 text-primary" />

              <span>
                <strong>{hoveredNode.name}</strong> •{' '}
                {hoveredNode.pct}% Mastery (
                {hoveredNode.level})

                {hoveredNode.isGap &&
                  ' — Active Prerequisite Repair Needed'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-text-secondary text-[11px]">
              <Info className="w-3.5 h-3.5 text-slate-400" />

              <span>
                Click any concept to open its learning module
              </span>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-secondary ml-auto">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Mastered (75%+)</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
              <span>Proficient</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span>Developing</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
              <span>Needs Attention</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
              <span>Novice</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};