import { FormEvent, useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Brain, Eye, EyeOff, Loader2, Lock, Mail, ArrowRight } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ParticlesBg } from '../components/ui/particles-bg';

export function Login() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // 3D card tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  if (user) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from || '/dashboard'} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email.trim(), password);

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
      {/* ── Particles background (z-0, pointer-events-none) ── */}
      <ParticlesBg />

      {/* ── Background atmosphere (z-auto, behind z-10 card) ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/30 via-indigo-800/40 to-slate-950 z-[1]" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Radial glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-indigo-400/15 blur-[80px] z-[1]" />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-indigo-300/15 blur-[60px] z-[1]"
        animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-cyan-400/10 blur-[60px] z-[1]"
        animate={{ opacity: [0.2, 0.35, 0.2], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', delay: 1 }}
      />

      {/* Ambient glow spots */}
      <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40 z-[1]" />
      <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40 z-[1]" />

      {/* ── Card container with 3D tilt ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative group">
            {/* Card glow pulse */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
              animate={{
                boxShadow: [
                  '0 0 10px 2px rgba(255,255,255,0.03)',
                  '0 0 15px 5px rgba(255,255,255,0.05)',
                  '0 0 10px 2px rgba(255,255,255,0.03)',
                ],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 4, repeat: Infinity, repeatType: 'mirror' }}
            />

            {/* ── Traveling light beams ── */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden hidden sm:block">
              {/* Top */}
              <motion.div
                className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ left: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3] }}
                transition={{ left: { duration: 2.5, repeat: Infinity, repeatDelay: 1 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror' } }}
              />
              {/* Right */}
              <motion.div
                className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent"
                animate={{ top: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3] }}
                transition={{ top: { duration: 2.5, repeat: Infinity, repeatDelay: 1, delay: 0.6 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 0.6 } }}
              />
              {/* Bottom */}
              <motion.div
                className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ right: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3] }}
                transition={{ right: { duration: 2.5, repeat: Infinity, repeatDelay: 1, delay: 1.2 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 1.2 } }}
              />
              {/* Left */}
              <motion.div
                className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent"
                animate={{ bottom: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3] }}
                transition={{ bottom: { duration: 2.5, repeat: Infinity, repeatDelay: 1, delay: 1.8 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 1.8 } }}
              />

              {/* Corner dots */}
              <motion.div className="absolute top-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }} />
              <motion.div className="absolute top-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.4, repeat: Infinity, repeatType: 'mirror', delay: 0.5 }} />
              <motion.div className="absolute bottom-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.2, repeat: Infinity, repeatType: 'mirror', delay: 1 }} />
              <motion.div className="absolute bottom-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.3, repeat: Infinity, repeatType: 'mirror', delay: 1.5 }} />
            </div>

            {/* Border glow on hover */}
            <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-white/[0.03] via-white/[0.07] to-white/[0.03] opacity-0 group-hover:opacity-70 transition-opacity duration-500" />

            {/* ── Glass card ── */}
            <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/[0.05] shadow-2xl overflow-hidden">
              {/* Subtle cross-hatch pattern */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)',
                  backgroundSize: '30px 30px',
                }}
              />

              {/* ── Header / branding ── */}
              <div className="relative text-center mb-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden"
                >
                  <Brain className="h-7 w-7 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-60" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80 mt-5"
                >
                  Welcome to EchoLearn
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/50 mt-2 text-sm"
                >
                  Your AI learning companion
                </motion.p>
              </div>

              {/* ── Card sub-header ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="relative mb-6"
              >
                <h2 className="text-xl font-semibold text-white/90">
                  Sign in
                </h2>

                <p className="text-sm text-white/40 mt-1">
                  Continue your learning journey.
                </p>
              </motion.div>

              {/* ── Error display ── */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300"
                >
                  {error}
                </motion.div>
              )}

              {/* ── Form (all logic untouched) ── */}
              <form onSubmit={handleSubmit} className="relative space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Email
                  </label>

                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <Mail
                      className={`absolute left-3 top-3 h-4 w-4 transition-colors duration-300 ${
                        focusedInput === 'email' ? 'text-white' : 'text-white/30'
                      }`}
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="you@example.com"
                      required
                      className="w-full h-11 rounded-lg border border-white/[0.08] bg-white/5 pl-10 pr-3 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-300 focus:border-white/20 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </motion.div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Password
                  </label>

                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <Lock
                      className={`absolute left-3 top-3 h-4 w-4 transition-colors duration-300 ${
                        focusedInput === 'password' ? 'text-white' : 'text-white/30'
                      }`}
                    />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="••••••••"
                      required
                      className="w-full h-11 rounded-lg border border-white/[0.08] bg-white/5 pl-10 pr-10 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-300 focus:border-white/20 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-white/30 hover:text-white transition-colors duration-300 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </motion.div>
                </div>

                {/* Submit button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full relative group/button mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Button glow */}
                  <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />

                  <div className="relative overflow-hidden bg-white text-black font-medium h-11 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                    {/* Shimmer while loading */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -z-10"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                      style={{
                        opacity: loading ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                      }}
                    />

                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 text-sm font-medium"
                        >
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing in...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-1 text-sm font-medium"
                        >
                          Sign in
                          <ArrowRight className="w-3.5 h-3.5 group-hover/button:translate-x-1 transition-transform duration-300" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              </form>

              {/* ── Footer link ── */}
              <motion.p
                className="relative text-center text-sm text-white/50 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="relative inline-block group/signup"
                >
                  <span className="relative z-10 font-semibold text-white hover:text-white/70 transition-colors duration-300">
                    Create one
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover/signup:w-full transition-all duration-300" />
                </Link>
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}