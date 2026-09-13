import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { 
  Brain, BookOpen, MessageSquare, ClipboardCheck, Target, TrendingUp, 
  Zap, ArrowRight, Sparkles, Search, GitBranch, BarChart3, Menu, X, 
  ChevronRight, Play, CheckCircle2, Users, Shield, Globe, Lightbulb, 
  Repeat, Eye 
} from 'lucide-react';

function ScrollReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 selection:text-primary">
      {/* SECTION 1: NAVBAR */}
      <nav 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-lg border-b border-slate-100 shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Brain className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-primary">Echo</span>
                <span className="text-text-primary">Learn</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">How It Works</a>
              <a href="#features" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">AI Tutor</a>
              <a href="#adaptive-learning" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Adaptive Learning</a>
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-text-primary hover:text-primary transition-colors">
                Log In
              </Link>
              <Link to="/signup" className="flex items-center gap-2 gradient-ai text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-text-primary hover:text-primary p-2"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 shadow-lg absolute w-full left-0 top-20 flex flex-col p-4 gap-4">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 font-medium text-text-secondary hover:text-primary hover:bg-slate-50 rounded-lg">Features</a>
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 font-medium text-text-secondary hover:text-primary hover:bg-slate-50 rounded-lg">How It Works</a>
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 font-medium text-text-secondary hover:text-primary hover:bg-slate-50 rounded-lg">AI Tutor</a>
            <a href="#adaptive-learning" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 font-medium text-text-secondary hover:text-primary hover:bg-slate-50 rounded-lg">Adaptive Learning</a>
            <div className="h-px bg-slate-100 my-2"></div>
            <Link to="/login" className="px-4 py-2 font-medium text-text-primary text-center">Log In</Link>
            <Link to="/signup" className="gradient-ai text-white px-4 py-3 rounded-xl font-semibold text-center flex justify-center items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </nav>

      {/* SECTION 2: HERO */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-background to-background" />
        
        {/* Floating circles */}
        <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <motion.div animate={{ y: [0, 30, 0], x: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary text-xs font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-8">
              <Sparkles className="w-4 h-4" />
              AI-POWERED PERSONAL LEARNING
            </div>
          </ScrollReveal>
          
          <ScrollReveal>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-primary leading-tight tracking-tight max-w-4xl mx-auto">
              Learning that understands <br className="hidden sm:block" />
              where you're <span className="text-gradient-ai">stuck.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal>
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mt-6 leading-relaxed">
              EchoLearn doesn't just tell students what they got wrong. It discovers why they're struggling, identifies missing prerequisites, and adapts what they should learn next.
            </p>
          </ScrollReveal>

          <ScrollReveal className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 gradient-ai text-white h-12 px-8 rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
              Start Learning
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-200 bg-white text-text-primary h-12 px-8 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              <Play className="w-5 h-5 text-primary" />
              See How It Works
            </a>
          </ScrollReveal>

          <ScrollReveal className="mt-12 flex flex-col items-center gap-3">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700 z-30">JD</div>
              <div className="w-10 h-10 rounded-full bg-cyan-100 border-2 border-white flex items-center justify-center text-xs font-bold text-cyan-700 z-20">AK</div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-xs font-bold text-emerald-700 z-10">SL</div>
            </div>
            <p className="text-sm font-medium text-text-secondary">Join thousands of students learning smarter</p>
          </ScrollReveal>
        </div>
      </section>

      {/* SECTION 3: AI INTELLIGENCE SHOWCASE */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <div className="inline-block bg-slate-100 text-slate-600 text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full mb-6">
              INTELLIGENT LEARNING
            </div>
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Your AI learning companion that <span className="text-gradient-ai">thinks.</span>
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-16">
              EchoLearn traces every mistake back to its root cause.
            </p>
          </ScrollReveal>

          <ScrollReveal className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-elevated border border-slate-100 border-l-4 border-l-primary p-8 relative overflow-hidden text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1.5 gradient-ai-subtle text-primary px-3 py-1 rounded-full text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Learning Insight
                </div>
                <div className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold">
                  87% confidence
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-text-primary mb-8 leading-snug">
                Your difficulty with <span className="text-danger">Overfitting</span> may be caused by a gap in <span className="text-primary">Training & Testing Data</span>.
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
                <div className="flex-1 bg-primary-50 border border-primary/20 rounded-xl px-4 py-3 w-full text-center sm:text-left">
                  <div className="text-[10px] uppercase font-bold text-primary mb-1 tracking-wider">Root Cause</div>
                  <div className="font-semibold text-text-primary">📚 Training & Testing</div>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-400 rotate-90 sm:rotate-0 flex-shrink-0" />
                <div className="flex-1 bg-warning-50 border border-warning/20 rounded-xl px-4 py-3 w-full text-center sm:text-left">
                  <div className="text-[10px] uppercase font-bold text-warning mb-1 tracking-wider">Struggling</div>
                  <div className="font-semibold text-text-primary">⚠️ Overfitting</div>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-400 rotate-90 sm:rotate-0 flex-shrink-0" />
                <div className="flex-1 bg-danger-50 border border-danger/20 rounded-xl px-4 py-3 w-full text-center sm:text-left">
                  <div className="text-[10px] uppercase font-bold text-danger mb-1 tracking-wider">Blocked</div>
                  <div className="font-semibold text-text-primary">❌ Regularization</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100 pt-6 mt-6">
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="bg-slate-50 border border-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg text-text-secondary">1. Review prerequisite</span>
                  <span className="bg-slate-50 border border-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg text-text-secondary">2. Teach it back</span>
                  <span className="bg-slate-50 border border-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg text-text-secondary">3. Reassess</span>
                </div>
                <Link to="/signup" className="flex-shrink-0 flex items-center gap-1.5 gradient-ai text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                  Start Fixing This <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-background border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">How EchoLearn Works</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              A continuous cycle that gets smarter with every interaction.
            </p>
          </ScrollReveal>

          <div className="flex flex-col lg:flex-row flex-wrap justify-center gap-6 relative">
            {[
              { icon: BookOpen, title: "Learn", desc: "Study concepts with AI-guided content", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: ClipboardCheck, title: "Test", desc: "Take adaptive assessments", color: "text-emerald-500", bg: "bg-emerald-50" },
              { icon: Search, title: "Diagnose", desc: "AI finds the root cause of mistakes", color: "text-indigo-500", bg: "bg-indigo-50" },
              { icon: MessageSquare, title: "Teach Back", desc: "Explain concepts in your own words", color: "text-purple-500", bg: "bg-purple-50" },
              { icon: Target, title: "Fix", desc: "Address specific knowledge gaps", color: "text-rose-500", bg: "bg-rose-50" },
              { icon: Repeat, title: "Reassess", desc: "Verify understanding through retesting", color: "text-amber-500", bg: "bg-amber-50" },
              { icon: TrendingUp, title: "Adapt", desc: "Your learning path evolves automatically", color: "text-cyan-500", bg: "bg-cyan-50" }
            ].map((step, idx) => (
              <ScrollReveal key={idx} className="w-full lg:w-64 relative z-10">
                <div className="bg-white p-6 rounded-2xl shadow-subtle border border-slate-100 h-full flex flex-col items-center text-center relative group hover:border-slate-300 transition-colors">
                  <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-md`}>
                    {idx + 1}
                  </div>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${step.bg}`}>
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">{step.title}</h3>
                  <p className="text-sm text-text-secondary">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: CORE FEATURES */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">Everything you need to learn smarter</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Powerful AI features designed for deep understanding.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "AI Tutor", desc: "Learn with an AI tutor that adapts explanations to your understanding.", bg: "bg-indigo-500" },
              { icon: ClipboardCheck, title: "Adaptive Quiz", desc: "Questions adjust to reveal what you actually know.", bg: "bg-cyan-500" },
              { icon: GitBranch, title: "Root-Cause Detection", desc: "Find the prerequisite concept behind your mistake.", bg: "bg-violet-500" },
              { icon: MessageSquare, title: "Teach Back", desc: "Explain concepts in your own words and let AI evaluate your understanding.", bg: "bg-emerald-500" },
              { icon: Lightbulb, title: "Adaptive Study Planner", desc: "Know exactly what you should learn next.", bg: "bg-amber-500" },
              { icon: BarChart3, title: "Learning Intelligence", desc: "See mastery, confidence, learning gaps and progress in one place.", bg: "bg-blue-500" }
            ].map((feature, idx) => (
              <ScrollReveal key={idx}>
                <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-card-hover hover:border-slate-200 transition-all duration-300 group h-full cursor-default">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform ${feature.bg}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mt-4">{feature.title}</h3>
                  <p className="text-text-secondary text-sm mt-2">{feature.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: DASHBOARD PREVIEW */}
      <section className="py-24 bg-background border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">Your learning, understood.</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              A real-time learning dashboard that shows what you know, what you don't, and what to do next.
            </p>
          </ScrollReveal>

          <ScrollReveal className="max-w-5xl mx-auto relative">
            <div className="bg-white rounded-2xl shadow-elevated border border-slate-100 p-6 lg:p-8 overflow-hidden relative">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="border border-slate-100 rounded-xl p-5 flex items-center gap-4 bg-slate-50/50">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-emerald-500 border-r-emerald-500 flex items-center justify-center text-lg font-bold text-slate-700 bg-white">78%</div>
                  <div>
                    <div className="text-sm text-text-secondary font-medium">Learning Health</div>
                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Healthy
                    </div>
                  </div>
                </div>
                
                <div className="border border-slate-100 rounded-xl p-5 bg-primary-50/30">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2 uppercase tracking-wide">
                    <Target className="w-4 h-4" /> Today's Best Action
                  </div>
                  <div className="font-semibold text-text-primary line-clamp-1">Review Training & Testing Data</div>
                  <div className="text-xs font-medium text-text-secondary mt-1">~15 min</div>
                </div>

                <div className="border border-slate-100 rounded-xl p-5 flex flex-col justify-center bg-slate-50/50">
                  <div className="flex items-center gap-2 text-text-primary text-2xl font-bold">
                    <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
                    2,450 <span className="text-sm font-medium text-text-secondary">pts</span>
                  </div>
                  <div className="text-sm font-medium text-indigo-600 mt-1 bg-indigo-50 inline-block px-2 py-0.5 rounded w-max">Level 5 Explorer</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Topic Mastery</h4>
                  <div className="space-y-4">
                    {[
                      { name: "ML Fundamentals", pct: 92, color: "bg-emerald-500" },
                      { name: "Training & Testing", pct: 45, color: "bg-amber-500" },
                      { name: "Overfitting", pct: 28, color: "bg-danger" },
                      { name: "Regularization", pct: 12, color: "bg-danger" }
                    ].map((topic, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm font-medium mb-1.5">
                          <span className="text-text-primary">{topic.name}</span>
                          <span className="text-text-secondary">{topic.pct}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${topic.color} rounded-full`} style={{ width: `${topic.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Learning Map Preview</h4>
                  <div className="relative border border-slate-100 rounded-xl p-6 bg-slate-50/50 flex flex-col gap-4">
                    <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-slate-200 z-0"></div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 ring-4 ring-slate-50">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-text-primary bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">ML Fundamentals</span>
                    </div>

                    <div className="flex items-center gap-4 relative z-10 ml-8">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 ring-4 ring-slate-50">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm font-bold text-primary bg-white px-3 py-1.5 rounded-lg border border-primary/30 shadow-sm ring-1 ring-primary/20">Training & Testing</span>
                    </div>

                    <div className="flex items-center gap-4 relative z-10 ml-16 opacity-50">
                      <div className="w-6 h-6 rounded-full bg-slate-300 text-white flex items-center justify-center flex-shrink-0 ring-4 ring-slate-50">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-text-secondary bg-white px-3 py-1.5 rounded-lg border border-slate-200">Overfitting</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fade out bottom overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SECTION 7: ADAPTIVE LEARNING */}
      <section id="adaptive-learning" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Visual Side */}
            <div className="relative order-2 lg:order-1 flex flex-col gap-6 p-8 bg-slate-50 rounded-3xl border border-slate-100">
              {/* Connecting vertical line */}
              <div className="absolute left-[3.25rem] top-12 bottom-12 w-0.5 bg-slate-200 z-0 hidden sm:block"></div>
              
              <ScrollReveal>
                <div className="relative z-10 flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-emerald-200 border-l-4 border-l-emerald-500">
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-500 text-emerald-500 flex items-center justify-center bg-emerald-50 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary text-sm">ML Fundamentals</h4>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">Mastered</span>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="relative z-10 flex items-center gap-4 bg-white p-4 rounded-xl shadow-elevated border border-amber-200 border-l-4 border-l-amber-500 sm:ml-8 transform scale-105">
                  <div className="w-10 h-10 rounded-full border-2 border-amber-500 text-amber-600 flex items-center justify-center bg-amber-50 shrink-0">
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-sm">Training & Testing</h4>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded mt-1 inline-block">In Progress</span>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="relative z-10 flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-danger/30 border-l-4 border-l-danger sm:ml-16">
                  <div className="w-10 h-10 rounded-full border-2 border-danger text-danger flex items-center justify-center bg-danger-50 shrink-0">
                    <X className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary text-sm">Overfitting</h4>
                    <span className="text-xs font-medium text-danger bg-danger-50 px-2 py-0.5 rounded mt-1 inline-block">Struggling</span>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="relative z-10 flex items-center gap-4 bg-white/50 p-4 rounded-xl border border-slate-200 border-l-4 border-l-slate-300 sm:ml-24 opacity-70">
                  <div className="w-10 h-10 rounded-full border-2 border-slate-300 text-slate-400 flex items-center justify-center bg-slate-50 shrink-0">
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-600 text-sm">Regularization</h4>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">Locked</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Text Side */}
            <div className="order-1 lg:order-2">
              <ScrollReveal>
                <div className="text-sm font-bold tracking-wider text-primary mb-3 uppercase">Adaptive Pathways</div>
                <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6">
                  Don't just treat the <span className="text-gradient-ai">symptom.</span>
                </h2>
                <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                  EchoLearn traces mistakes back through concept dependencies to identify the knowledge gap causing them. We build a personalized learning path to strengthen your foundation before moving forward.
                </p>
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-text-primary font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Find the root cause
                  </div>
                  <div className="flex items-center gap-3 text-text-primary font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Fix the foundation
                  </div>
                  <div className="flex items-center gap-3 text-text-primary font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Move forward
                  </div>
                </div>

                <Link to="/signup" className="inline-flex items-center gap-2 font-semibold text-primary hover:text-indigo-700 transition-colors">
                  Start Your Journey <ArrowRight className="w-5 h-5" />
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FINAL CTA */}
      <section className="py-24 relative overflow-hidden bg-slate-900 border-t border-slate-800">
        <div className="absolute inset-0 gradient-ai opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiLz48L3N2Zz4=')] opacity-30"></div>
        
        {/* Floating background elements */}
        <motion.div animate={{ y: [0, -30, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <motion.div animate={{ y: [0, 40, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute -bottom-32 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Stop guessing what to learn next.</h2>
            <p className="text-white/80 text-lg sm:text-xl max-w-xl mx-auto mb-10">
              Let EchoLearn understand your learning and build the next step for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-text-primary h-12 px-8 rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-lg shadow-black/10">
                Start Learning
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 border border-white/30 text-white h-12 px-8 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                Log In
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SECTION 9: FOOTER */}
      <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">EchoLearn</span>
              </div>
              <p className="text-slate-400 max-w-xs">
                Learn smarter. Understand deeper. The AI learning platform that adapts to your mind.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">AI Tutor</a></li>
                <li><a href="#adaptive-learning" className="hover:text-white transition-colors">Adaptive Learning</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Account</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Log In</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            © 2024 EchoLearn. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
