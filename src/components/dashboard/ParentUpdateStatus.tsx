import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CheckCircle,
  Smartphone,
  Mail,
  MessageCircle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';

type UpdateChannel = 'whatsapp' | 'sms' | 'email';

interface ParentUpdate {
  id: string;
  update_type: string;
  message: string;
  channel: UpdateChannel;
  status: string;
  created_at: string;
  sent_at: string | null;
}

const channelIcons: Record<UpdateChannel, React.ElementType> = {
  whatsapp: MessageCircle,
  sms: Smartphone,
  email: Mail,
};

function formatDate(isoString: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoString));
}

export const ParentUpdateStatus: React.FC = () => {
  const navigate = useNavigate();

  const [latestUpdate, setLatestUpdate] =
    useState<ParentUpdate | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLatestUpdate = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLatestUpdate(null);
          return;
        }

        const { data, error } = await supabase
          .from('parent_updates')
          .select(
            'id, update_type, message, channel, status, created_at, sent_at'
          )
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error(
            'Error loading parent update:',
            error
          );
          setLatestUpdate(null);
          return;
        }

        setLatestUpdate(data?.[0] ?? null);
      } catch (error) {
        console.error(
          'Unexpected error loading parent update:',
          error
        );
        setLatestUpdate(null);
      } finally {
        setLoading(false);
      }
    };

    loadLatestUpdate();
  }, []);

  const handleViewUpdates = () => {
    navigate('/parent-updates');
  };

  /*
   * Don't show an empty card while data is loading.
   */
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="h-full p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-text-primary" />

            <h2 className="text-lg font-semibold text-text-primary">
              Parent Updates
            </h2>
          </div>

          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-100 rounded w-2/3" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="h-12 bg-slate-100 rounded" />
          </div>
        </Card>
      </motion.div>
    );
  }

  /*
   * No parent update yet.
   * Still keep the card visible so the dashboard doesn't look broken.
   */
  if (!latestUpdate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="h-full p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-text-primary" />

            <h2 className="text-lg font-semibold text-text-primary">
              Parent Updates
            </h2>
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 mb-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4" />

              <span className="text-sm font-medium">
                No parent updates yet
              </span>
            </div>

            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Parent progress updates will appear here once
              an update is generated.
            </p>
          </div>

          <button
            onClick={handleViewUpdates}
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline cursor-pointer"
          >
            View All Updates
            <ArrowRight className="w-4 h-4" />
          </button>
        </Card>
      </motion.div>
    );
  }

  const ChannelIcon =
    channelIcons[latestUpdate.channel] ?? Mail;

  const isSuccessful =
    latestUpdate.status.toLowerCase() === 'sent' ||
    latestUpdate.status.toLowerCase() === 'delivered' ||
    latestUpdate.status.toLowerCase() === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="h-full p-5">

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-text-primary" />

          <h2 className="text-lg font-semibold text-text-primary">
            Parent Updates
          </h2>
        </div>

        {/* Latest Update */}
        <div
          className={`rounded-lg p-3 mb-4 border ${
            isSuccessful
              ? 'bg-success/5 border-success/20'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2 gap-2">

            <div
              className={`flex items-center gap-1.5 font-medium text-sm ${
                isSuccessful
                  ? 'text-success'
                  : 'text-amber-700'
              }`}
            >
              <CheckCircle className="w-4 h-4" />

              <span className="capitalize">
                Update {latestUpdate.status}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <ChannelIcon className="w-3.5 h-3.5" />

              <span className="capitalize">
                {latestUpdate.channel}
              </span>
            </div>

          </div>

          <div className="text-xs text-text-secondary mb-2">
            {latestUpdate.sent_at
              ? `Sent: ${formatDate(latestUpdate.sent_at)}`
              : `Created: ${formatDate(latestUpdate.created_at)}`}
          </div>

          <p className="text-sm text-text-primary line-clamp-2">
            "{latestUpdate.message}"
          </p>
        </div>

        {/* Navigation */}
        <button
          onClick={handleViewUpdates}
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          View All Updates
          <ArrowRight className="w-4 h-4" />
        </button>

      </Card>
    </motion.div>
  );
};