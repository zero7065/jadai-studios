import React from 'react';
import GlassCard from '../ui/GlassCard';
import StatusBadge from '../ui/StatusBadge';
import type { PortfolioProject } from '../../lib/data/portfolio';
import { ArrowUpRight } from 'lucide-react';

export interface PortfolioCardProps {
  project: PortfolioProject;
  onClick?: () => void;
  index?: number;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  project,
  onClick,
  index = 0,
}) => {
  return (
    <div
      onClick={onClick}
      style={{ animationDelay: `${index * 80}ms` }}
      className="group cursor-pointer select-none transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
    >
      <GlassCard className="h-full flex flex-col justify-between p-6 border-[rgba(201,168,76,0.2)] group-hover:border-[rgba(201,168,76,0.5)] transition-all">
        {/* Top Meta */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8a6e2a]">
              {project.category}
            </span>
            <StatusBadge status={project.status} />
          </div>

          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-display font-semibold text-[#f5f3f0] group-hover:text-[#e8c96a] transition-colors">
              {project.title}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-[#8a6e2a] group-hover:text-[#C9A84C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
          </div>

          <p className="text-xs text-[#c4c0bb] line-clamp-3 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Bottom Stack Chips */}
        <div className="pt-4 mt-4 border-t border-[rgba(201,168,76,0.1)] flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#050404] border border-[rgba(201,168,76,0.15)] text-[#8a6e2a]"
            >
              {tech}
            </span>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default PortfolioCard;
