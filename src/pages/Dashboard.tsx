import React from 'react';
import { LearningHealthCard } from '../components/dashboard/LearningHealthCard';
import { AIDiscoveryHero } from '../components/dashboard/AIDiscoveryHero';
import { TodaysBestAction } from '../components/dashboard/TodaysBestAction';
import { TopicProgressGrid } from '../components/dashboard/TopicProgressGrid';
import { LearningMap } from '../components/dashboard/LearningMap';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { ParentUpdateStatus } from '../components/dashboard/ParentUpdateStatus';
import { EchoPointsCard } from '../components/dashboard/EchoPointsCard';

export const Dashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* ==================================================
          TOP SECTION
      ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* LEFT - AI DISCOVERY + TODAY'S ACTION */}
        <div className="lg:col-span-2 space-y-6">
          <AIDiscoveryHero />

          <TodaysBestAction />
        </div>

        {/* RIGHT - HEALTH + POINTS */}
        <div className="space-y-6">
          <LearningHealthCard />

          <EchoPointsCard />
        </div>
      </div>

      {/* ==================================================
          TOPIC PROGRESS
      ================================================== */}
      <div className="pt-2">
        <TopicProgressGrid />
      </div>

      {/* ==================================================
          LEARNING MAP + ACTIVITY + PARENT
      ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* LEARNING MAP */}
        <div className="lg:col-span-2">
          <LearningMap />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          <RecentActivity />

          <ParentUpdateStatus />
        </div>
      </div>

    </div>
  );
}