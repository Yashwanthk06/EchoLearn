import { Sparkles, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { AIDiscovery } from '../../types';

interface AIInsightCardProps {
  discovery: AIDiscovery;
}

export function AIInsightCard({ discovery }: AIInsightCardProps) {
  return (
    <Card className="p-5 border-l-4 border-l-primary gradient-ai-subtle">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-primary">{discovery.title}</span>
        <Badge variant="info" className="ml-auto">{Math.round(discovery.confidence * 100)}%</Badge>
      </div>

      <p className="text-sm text-text-primary mb-3">{discovery.insight}</p>

      {discovery.recommendedSteps.length > 0 && (
        <div className="space-y-1">
          {discovery.recommendedSteps.map((step) => (
            <div key={step.order} className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                {step.order}
              </span>
              <span>{step.action}</span>
              <span className="text-text-secondary/70 ml-auto">{step.estimatedMinutes}m</span>
            </div>
          ))}
        </div>
      )}

      <button className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline mt-3 cursor-pointer">
        View Details <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </Card>
  );
}
