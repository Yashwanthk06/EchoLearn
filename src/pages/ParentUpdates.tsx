import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  Smartphone,
  CheckCircle,
  Check,
  AlertCircle,
  Loader2,
  Users,
  RefreshCw,
} from 'lucide-react';

import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { supabase } from '../lib/supabase';

type UpdateChannel =
  | 'whatsapp'
  | 'email'
  | 'sms';

type UpdateStatus =
  | 'sent'
  | 'delivered'
  | 'read';

type ParentUpdate = {
  id: string;
  parent_id: string;
  student_id: string;
  update_type: string;
  message: string;
  channel: string;
  status: string;
  created_at: string | null;
  sent_at: string | null;
};

type ParentLink = {
  id: string;
  parent_id: string;
  student_id: string;
  status: string;
  created_at: string | null;
};

/* ---------------------------------
   Channel configuration
---------------------------------- */

const channelConfig: Record<
  UpdateChannel,
  {
    icon: React.ElementType;
    label: string;
  }
> = {
  whatsapp: {
    icon: MessageCircle,
    label: 'WhatsApp',
  },
  email: {
    icon: Mail,
    label: 'Email',
  },
  sms: {
    icon: Smartphone,
    label: 'SMS',
  },
};

/* ---------------------------------
   Helpers
---------------------------------- */

function getChannelConfig(channel: string) {
  if (
    channel === 'whatsapp' ||
    channel === 'email' ||
    channel === 'sms'
  ) {
    return channelConfig[channel];
  }

  return {
    icon: MessageCircle,
    label:
      channel
        ? channel.charAt(0).toUpperCase() +
          channel.slice(1)
        : 'Update',
  };
}

function getStatusBadge(status: string): {
  variant:
    | 'success'
    | 'info'
    | 'novice';
  label: string;
} {
  if (status === 'read') {
    return {
      variant: 'success',
      label: 'Read',
    };
  }

  if (status === 'delivered') {
    return {
      variant: 'info',
      label: 'Delivered',
    };
  }

  return {
    variant: 'novice',
    label:
      status
        ? status.charAt(0).toUpperCase() +
          status.slice(1)
        : 'Sent',
  };
}

function formatDate(
  value: string | null
) {
  if (!value) {
    return 'Date unavailable';
  }

  return new Date(value).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );
}

/*
 * The database currently stores one message
 * rather than separate highlights and concerns.
 *
 * We keep the UI useful by displaying the
 * message as the main update content.
 */
function getUpdateHighlights(
  update: ParentUpdate
) {
  const text = update.message?.trim();

  if (!text) {
    return [];
  }

  return [text];
}

/*
 * Detect whether a message appears to describe
 * a concern. This is only presentation logic;
 * it does not change database data.
 */
function isConcernMessage(
  message: string
) {
  const lower = message.toLowerCase();

  return (
    lower.includes('struggl') ||
    lower.includes('weak') ||
    lower.includes('gap') ||
    lower.includes('attention') ||
    lower.includes('needs improvement') ||
    lower.includes('difficulty') ||
    lower.includes('low score')
  );
}

/* ---------------------------------
   Page
---------------------------------- */

export function ParentUpdates() {
  const [updates, setUpdates] =
    useState<ParentUpdate[]>([]);

  const [parentLinks, setParentLinks] =
    useState<ParentLink[]>([]);

  const [expandedId, setExpandedId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /* ---------------------------------
     Load real Supabase data
  ---------------------------------- */

  const loadParentUpdates = async () => {
    setLoading(true);
    setError(null);

    try {
      /* -------------------------------
         Get current student
      -------------------------------- */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(
          `Unable to verify login: ${userError.message}`
        );
      }

      if (!user) {
        throw new Error(
          'Please log in to view parent updates.'
        );
      }

      /* -------------------------------
         Load parent-student links
      -------------------------------- */

      const {
        data: linkData,
        error: linkError,
      } = await supabase
        .from('parent_student_links')
        .select(
          'id, parent_id, student_id, status, created_at'
        )
        .eq(
          'student_id',
          user.id
        );

      if (linkError) {
        throw new Error(
          `Unable to load parent connection: ${linkError.message}`
        );
      }

      /* -------------------------------
         Load parent updates
      -------------------------------- */

      const {
        data: updateData,
        error: updateError,
      } = await supabase
        .from('parent_updates')
        .select(
          `
            id,
            parent_id,
            student_id,
            update_type,
            message,
            channel,
            status,
            created_at,
            sent_at
          `
        )
        .eq(
          'student_id',
          user.id
        )
        .order(
          'created_at',
          {
            ascending: false,
          }
        );

      if (updateError) {
        throw new Error(
          `Unable to load parent updates: ${updateError.message}`
        );
      }

      setParentLinks(
        linkData ?? []
      );

      setUpdates(
        updateData ?? []
      );
    } catch (err) {
      console.error(
        'Parent updates error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load parent updates.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParentUpdates();
  }, []);

  /* ---------------------------------
     Toggle update
  ---------------------------------- */

  const toggleExpand = (
    id: string
  ) => {
    setExpandedId((previous) =>
      previous === id
        ? null
        : id
    );
  };

  /* ---------------------------------
     Loading
  ---------------------------------- */

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-10 flex flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />

          <h2 className="font-semibold text-text-primary">
            Loading parent updates...
          </h2>

          <p className="text-sm text-text-secondary mt-1">
            EchoLearn is checking your parent
            communication history.
          </p>
        </Card>
      </div>
    );
  }

  /* ---------------------------------
     Error
  ---------------------------------- */

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 text-center border border-red-200">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-text-primary">
            Unable to load parent updates
          </h1>

          <p className="mt-2 text-text-secondary">
            Something went wrong while loading
            your communication history.
          </p>

          <div className="mt-5 rounded-xl bg-red-50 border border-red-100 p-4 text-left">
            <p className="text-sm text-red-700 break-words">
              {error}
            </p>
          </div>

          <Button
            variant="primary"
            className="mt-5"
            onClick={
              loadParentUpdates
            }
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  /* ---------------------------------
     No parent connection + no updates
  ---------------------------------- */

  const hasActiveParentLink =
    parentLinks.some(
      (link) =>
        link.status ===
          'active' ||
        link.status ===
          'approved' ||
        link.status ===
          'connected'
    );

  if (
    updates.length === 0
  ) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="max-w-3xl mx-auto space-y-6"
      >
        {/* Header */}

        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Parent Updates
          </h1>

          <p className="text-text-secondary mt-1">
            Communication history with parents
          </p>
        </div>

        {/* Status card */}

        <Card className="p-6 bg-gradient-to-r from-primary/5 via-white to-cyan-50/40 border-primary/10">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="font-semibold text-text-primary">
                {hasActiveParentLink
                  ? 'Parent connected'
                  : 'No parent connected yet'}
              </h2>

              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                {hasActiveParentLink
                  ? 'Your parent is connected, but there are no communication updates yet.'
                  : 'Once a parent is connected and EchoLearn sends an update, your communication history will appear here.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Empty state */}

        <EmptyState
          icon={
            <MessageCircle className="h-8 w-8 text-primary" />
          }
          title="No parent updates yet"
          description={
            hasActiveParentLink
              ? 'Your parent communication history will appear here when updates are sent.'
              : 'Connect a parent to enable progress updates and learning notifications.'
          }
        />

        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={
              loadParentUpdates
            }
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>
    );
  }

  /* ---------------------------------
     Normal UI
  ---------------------------------- */

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Parent Updates
          </h1>

          <p className="text-text-secondary mt-1">
            Communication history with parents
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={
            loadParentUpdates
          }
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Connection status */}

      <Card className="p-4 bg-emerald-50 border border-emerald-100">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-600" />

          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Parent communication active
            </p>

            <p className="text-xs text-emerald-700 mt-0.5">
              {updates.length}{' '}
              {updates.length === 1
                ? 'update'
                : 'updates'}{' '}
              available.
            </p>
          </div>
        </div>
      </Card>

      {/* Updates */}

      <div className="space-y-4">
        {updates.map(
          (update) => {
            const isExpanded =
              expandedId ===
              update.id;

            const channel =
              getChannelConfig(
                update.channel
              );

            const status =
              getStatusBadge(
                update.status
              );

            const ChannelIcon =
              channel.icon;

            const highlights =
              getUpdateHighlights(
                update
              );

            const concern =
              isConcernMessage(
                update.message
              );

            return (
              <Card
                key={update.id}
                className="p-5"
              >
                {/* Main row */}

                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() =>
                    toggleExpand(
                      update.id
                    )
                  }
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                        <ChannelIcon className="h-4 w-4" />

                        <span>
                          {channel.label}
                        </span>
                      </div>

                      <Badge
                        variant={
                          status.variant
                        }
                      >
                        {status.label}
                      </Badge>

                      {update.update_type && (
                        <Badge variant="info">
                          {update.update_type}
                        </Badge>
                      )}

                      <span className="text-xs text-text-secondary">
                        {formatDate(
                          update.sent_at ??
                            update.created_at
                        )}
                      </span>
                    </div>

                    <p className="text-sm text-text-primary leading-relaxed">
                      {update.message}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="ml-4 p-1 text-text-secondary hover:text-text-primary transition-colors"
                    onClick={(event) => {
                      event.stopPropagation();

                      toggleExpand(
                        update.id
                      );
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Expanded content */}

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: 'auto',
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-border space-y-4">
                        {/* Update details */}

                        <div>
                          <h4 className="text-sm font-semibold text-text-primary mb-2">
                            Update Details
                          </h4>

                          <div className="rounded-xl bg-slate-50 border border-border/50 p-4">
                            <p className="text-sm text-text-secondary leading-relaxed">
                              {
                                update.message
                              }
                            </p>
                          </div>
                        </div>

                        {/* Highlights */}

                        {!concern &&
                          highlights.length >
                            0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-text-primary mb-2">
                                Highlights
                              </h4>

                              <ul className="space-y-1.5">
                                {highlights.map(
                                  (
                                    highlight,
                                    index
                                  ) => (
                                    <li
                                      key={
                                        index
                                      }
                                      className="flex items-start gap-2 text-sm text-text-secondary"
                                    >
                                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />

                                      <span>
                                        {
                                          highlight
                                        }
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}

                        {/* Concern */}

                        {concern && (
                          <div>
                            <h4 className="text-sm font-semibold text-text-primary mb-2">
                              Area of Concern
                            </h4>

                            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />

                                <p className="text-sm text-text-secondary leading-relaxed">
                                  {
                                    update.message
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Status */}

                        <div className="flex items-center gap-2 text-xs text-text-secondary pt-2">
                          <CheckCircle className="h-3.5 w-3.5 text-success" />

                          <span>
                            Update{' '}
                            {status.label.toLowerCase()}
                          </span>

                          {update.sent_at && (
                            <>
                              <span>
                                •
                              </span>

                              <span>
                                Sent{' '}
                                {formatDate(
                                  update.sent_at
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          }
        )}
      </div>
    </motion.div>
  );
}