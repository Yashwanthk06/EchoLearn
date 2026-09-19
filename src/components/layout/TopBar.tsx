import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  X,
  BookOpen,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface TopBarProps {
  title?: string;
  subtitle?: string;
}

interface Topic {
  id: string;
  name: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  icon: 'book' | 'alert' | 'success';
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  /* Derive a friendly display name from the auth user */
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Student';

  const displayEmail = user?.email ?? '';


  const [greeting, setGreeting] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Continue learning',
      message: 'Keep building your Machine Learning skills today.',
      icon: 'book',
    },
    {
      id: '2',
      title: 'Learning gaps detected',
      message: 'Check your learning gaps to see what needs attention.',
      icon: 'alert',
    },
    {
      id: '3',
      title: 'Keep your streak going',
      message: 'Complete a learning activity today to maintain your progress.',
      icon: 'success',
    },
  ]);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Greeting
  useEffect(() => {
    const hour = new Date().getHours();

    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Load topics for search
  useEffect(() => {
    const loadTopics = async () => {
      const { data } = await supabase
        .from('topics')
        .select('id, name')
        .order('name');

      if (data) {
        setTopics(data);
      }
    };

    loadTopics();
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setSearchOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search results
  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Search button
  const handleSearchOpen = () => {
    setSearchOpen((prev) => !prev);
    setNotificationOpen(false);
    setProfileOpen(false);
  };

  // Open topic
  const handleTopicClick = (topicId: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/learn/${topicId}`);
  };

  // Notification button
  const handleNotificationOpen = () => {
    setNotificationOpen((prev) => !prev);
    setSearchOpen(false);
    setProfileOpen(false);
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Notification click
  const handleNotificationClick = (notification: Notification) => {
    setNotificationOpen(false);

    if (notification.icon === 'alert') {
      navigate('/gaps');
    } else if (notification.icon === 'book') {
      navigate('/learn');
    } else {
      navigate('/progress');
    }
  };

  // Logout
  const handleLogout = async () => {
    setProfileOpen(false);

    const { error } = await signOut();

    if (!error) {
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
      
      {/* LEFT */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {title || `${greeting}, ${displayName}`}
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          {subtitle || "Let's continue learning today!"}
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* SEARCH */}
        <div className="relative" ref={searchRef}>
          <button
            onClick={handleSearchOpen}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors hidden sm:flex"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {searchOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              
              {/* Search input */}
              <div className="p-3 border-b border-slate-100">
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                  <Search className="w-4 h-4 text-slate-400" />

                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ML topics..."
                    className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  />

                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto p-2">
                {searchQuery.trim() === '' ? (
                  <div className="px-3 py-6 text-center">
                    <Search className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">
                      Search your learning topics
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try "Regression" or "Overfitting"
                    </p>
                  </div>
                ) : filteredTopics.length > 0 ? (
                  filteredTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic.id)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-indigo-50 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {topic.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          Machine Learning
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-8 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      No topics found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try another search term
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* NOTIFICATIONS */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={handleNotificationOpen}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />

            {notifications.length > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Notifications
                  </h3>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {notifications.length} new
                  </p>
                </div>

                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Notifications */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() =>
                        handleNotificationClick(notification)
                      }
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          notification.icon === 'book'
                            ? 'bg-indigo-100'
                            : notification.icon === 'alert'
                            ? 'bg-amber-100'
                            : 'bg-emerald-100'
                        }`}
                      >
                        {notification.icon === 'book' && (
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                        )}

                        {notification.icon === 'alert' && (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        )}

                        {notification.icon === 'success' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800">
                          {notification.title}
                        </p>

                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-10 text-center">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />

                    <p className="text-sm font-medium text-slate-600">
                      You're all caught up
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      No new notifications
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setSearchOpen(false);
              setNotificationOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
          >
            <Avatar
              name={displayName}
              src={undefined}
              size="md"
            />

            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                {displayName}
              </p>

              <p className="text-xs text-slate-500">
                Student
              </p>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform ${
                profileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={displayName}
                    src={undefined}
                    size="md"
                  />

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {displayName}
                    </p>

                    <p className="text-xs text-slate-500 truncate">
                      {displayEmail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};