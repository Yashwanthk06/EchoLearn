import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const TodaysBestAction: React.FC = () => {
  const navigate = useNavigate();

  const handleStartTeachBack = () => {
    navigate('/teach-back');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      whileHover={{ y: -2 }}
      className="relative rounded-xl overflow-hidden shadow-card border border-indigo-200 bg-white"
    >
      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary" />

      <Card className="rounded-none border-0 h-full p-5 sm:p-6 bg-gradient-to-r from-indigo-50/40 via-white to-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pl-2 sm:pl-3">

          {/* Left / Main info */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold uppercase tracking-wider">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span>Today's Best Action</span>
              </div>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold">
                <MessageSquare className="w-3 h-3 text-cyan-600" />
                Teach Back
              </span>

              <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium ml-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                8 minutes
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
              Explain Overfitting in your own words
            </h3>

            <p className="text-sm text-text-secondary leading-relaxed">
              Explaining this concept will help verify whether your understanding is complete and
              solidify the boundary between memorization and true generalization.
            </p>
          </div>

          {/* Right CTA */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto shadow-card hover:shadow-card-hover font-semibold px-6 py-2.5"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={handleStartTeachBack}
            >
              Start Teach Back
            </Button>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>+50 EchoPoints on completion</span>
            </div>
          </div>

        </div>
      </Card>
    </motion.div>
  );
};