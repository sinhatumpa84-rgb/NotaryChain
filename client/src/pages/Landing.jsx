import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineDocumentText, HiOutlineShieldCheck, HiOutlineUserGroup, HiOutlineFingerPrint, HiOutlineListBullet, HiOutlineBuildingLibrary } from 'react-icons/hi2';

const Landing = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4 px-8 flex justify-between items-center">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">NotaryChain</div>
        <div className="space-x-4">
          <Link to="/login" className="text-slate-300 hover:text-white px-4 py-2 transition-colors">Log In</Link>
          <Link to="/signup" className="bg-white text-slate-900 px-5 py-2 rounded-full font-medium hover:bg-indigo-50 transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 min-h-screen flex items-center justify-center">
        <motion.div style={{ y }} className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
        </motion.div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-7xl font-extrabold tracking-tight mb-8">
            AI-Powered Digital <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">Notarization</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Secure, verify, and notarize documents with enterprise-grade AI and blockchain technology for the modern business world.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all">
              Start Free Trial
            </Link>
            <button className="px-8 py-4 rounded-full font-semibold text-white border border-white/20 hover:bg-white/5 backdrop-blur-sm transition-all">
              Watch Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-8 relative z-10 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Enterprise-Grade Features</h2>
            <p className="text-slate-400">Everything you need to manage secure digital transactions.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <HiOutlineDocumentText />, title: 'AI Document Analysis', desc: 'Instantly extract and verify data from any document format using advanced OCR.' },
              { icon: <HiOutlineShieldCheck />, title: 'Digital Notarization', desc: 'Legally binding digital signatures with tamper-evident cryptographic seals.' },
              { icon: <HiOutlineFingerPrint />, title: 'Identity Verification', desc: 'Biometric liveness checks and global ID document verification.' },
              { icon: <HiOutlineBuildingLibrary />, title: 'Bank Integration', desc: 'Seamlessly connect with major financial institutions for workflow automation.' },
              { icon: <HiOutlineListBullet />, title: 'Audit Trail', desc: 'Immutable, time-stamped records of every action taken on your documents.' },
              { icon: <HiOutlineUserGroup />, title: 'Role-Based Access', desc: 'Granular permissions for companies, notaries, and external stakeholders.' }
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-8 rounded-3xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                  {React.cloneElement(f.icon, { className: 'w-8 h-8' })}
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-24 px-8 bg-gradient-to-br from-indigo-900 to-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Documents Processed', value: '50K+' },
            { label: 'Active Users', value: '2,000+' },
            { label: 'Countries Supported', value: '25+' },
            { label: 'Uptime', value: '99.99%' }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-indigo-200">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
export default Landing;
