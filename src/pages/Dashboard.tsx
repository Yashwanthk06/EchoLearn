import React from 'react';
import { motion } from 'framer-motion';
import { LearningHealthCard } from '../components/dashboard/LearningHealthCard';
import { AIDiscoveryHero } from '../components/dashboard/AIDiscoveryHero';
import { TodaysBestAction } from '../components/dashboard/TodaysBestAction';
import { TopicProgressGrid } from '../components/dashboard/TopicProgressGrid';
import { LearningMap } from '../components/dashboard/LearningMap';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { ParentUpdateStatus } from '../components/dashboard/ParentUpdateStatus';
import { EchoPointsCard } from '../components/dashboard/EchoPointsCard';

/* ─── Animation helpers ──────────────────────────────────── */

const sectionVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.10,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.40, ease: 'easeOut' as const },
  },
};

export const Dashboard: React.FC = () => {
  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6 pb-12"
      initial="hidden"
      animate="show"
      variants={sectionVariants}
    >

      {/* ==================================================
          TOP SECTION
      ================================================== */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
        variants={sectionVariants}
      >
        {/* LEFT - AI DISCOVERY + TODAY'S ACTION */}
        <motion.div className="lg:col-span-2 space-y-6" variants={cardVariant}>
          <AIDiscoveryHero />
          <TodaysBestAction />
        </motion.div>

        {/* RIGHT - HEALTH + POINTS */}
        <motion.div className="space-y-6" variants={cardVariant}>
          <LearningHealthCard />
          <EchoPointsCard />
        </motion.div>
      </motion.div>

      {/* ==================================================
          TOPIC PROGRESS
      ================================================== */}
      <motion.div className="pt-2" variants={cardVariant}>
        <TopicProgressGrid />
      </motion.div>

      {/* ==================================================
          LEARNING MAP + ACTIVITY + PARENT
      ================================================== */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
        variants={sectionVariants}
      >
        {/* LEARNING MAP */}
        <motion.div className="lg:col-span-2" variants={cardVariant}>
          <LearningMap />
        </motion.div>

        {/* RIGHT SIDEBAR */}
        <motion.div className="space-y-6" variants={cardVariant}>
          <RecentActivity />
          <ParentUpdateStatus />
        </motion.div>
      </motion.div>

    </motion.div>
  );
};