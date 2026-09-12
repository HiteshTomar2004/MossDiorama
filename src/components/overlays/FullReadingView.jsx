import React, { useState } from 'react'
import { projectsData } from '../../data/projectsData'
import { resumeData } from '../../data/resumeData'
import { blogPostsData } from '../../data/blogPostsData'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import {
  Sparkles,
  ExternalLink,
  Download,
  Briefcase,
  GraduationCap,
  Mail,
  ArrowUpRight,
  Box,
  Compass,
  Send,
  CheckCircle2,
  ChevronRight,
  Eye,
  MapPin,
  ArrowUp,
  BookOpen,
  Calendar,
  Clock,
  Layers,
  Code
} from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '../common/Icons'

export const FullReadingView = () => {
  const is2DDarkMode = usePortfolioStore((s) => s.is2DDarkMode)
  const toggle3DMode = usePortfolioStore((s) => s.toggle3DMode)
  const isLight = !is2DDarkMode

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedBlogArticle, setSelectedBlogArticle] = useState(null)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactSubmitted, setContactSubmitted] = useState(false)

  const categories = ['All', 'Creative / 3D', 'Full-Stack / AI', 'Open Source']
  const filteredProjects = selectedCategory === 'All'
    ? projectsData
    : projectsData.filter((p) => p.category === selectedCategory)

  const handleContactSubmit = (e) => {
    e.preventDefault()
    if (!contactForm.name || !contactForm.email || !contactForm.message) return
    setContactSubmitted(true)
  }

  const handleDownloadResume = (e) => {
    e.preventDefault()
    window.print()
  }

  // Theme dynamic class definitions
  const sectionBorder = isLight ? 'border-neutral-200/90' : 'border-[#222e28]'
  const cardBg = isLight
    ? 'bg-white border border-neutral-200/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] hover:border-neutral-400/80'
    : 'bg-[#121815] border border-[#232f28] hover:border-[#384840] shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
  const textMuted = isLight ? 'text-neutral-600' : 'text-[#9caaa2]'
  const textHead = isLight ? 'text-neutral-950' : 'text-[#f2eee7]'
  const accentGold = isLight ? 'text-amber-800' : 'text-[#c89658]'
  const badgeBg = isLight
    ? 'bg-neutral-100 text-neutral-800 border-neutral-200'
    : 'bg-[#18211c] text-[#a9bcaf] border-[#293730]'

  return (
    <main
      className={`w-full max-w-4xl mx-auto px-4 sm:px-6 py-28 sm:py-32 space-y-28 transition-colors duration-300 selectable-prose ${
        isLight ? 'text-neutral-800' : 'text-[#f0ede6]'
      }`}
    >
      {/* =========================================================================
          1. HERO & IDENTITY GATEWAY (#hearth)
         ========================================================================= */}
      <section id="hearth" className="pt-10 sm:pt-16 space-y-8 text-center scroll-mt-28">
        {/* Top Lore Monogram / Overline */}
        <div className="flex items-center justify-center space-x-3 text-xs font-['Cinzel'] tracking-[0.3em] uppercase">
          <span className={accentGold}>◈</span>
          <span className={isLight ? 'text-neutral-500 font-semibold' : 'text-[#c89658]'}>
            The Moss Grotto · Digital Archive
          </span>
          <span className={accentGold}>◈</span>
        </div>

        {/* Master Name Headline with high-impact typography */}
        <div className="space-y-3">
          <h1
            className={`font-['Instrument_Serif'] text-6xl sm:text-8xl md:text-9xl tracking-tight leading-[0.9] ${textHead}`}
          >
            {resumeData.name}
          </h1>

          <p
            className={`font-['Newsreader'] text-xl sm:text-2xl italic tracking-wide ${
              isLight ? 'text-neutral-600' : 'text-[#9bb1a4]'
            }`}
          >
            {resumeData.title}
          </p>
        </div>

        {/* Location & Status Pill */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-['JetBrains_Mono']">
          <span
            className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border ${
              isLight ? 'bg-neutral-100 border-neutral-300 text-neutral-700' : 'bg-[#141b17] border-[#293730] text-[#a4b6ab]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{resumeData.location}</span>
          </span>

          <span
            className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border ${
              isLight ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-[#c89658]/10 border-[#c89658]/30 text-[#e4b77d]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Open for Select Collaborations</span>
          </span>
        </div>

        {/* Editorial Creed / Bio Statement */}
        <div className="max-w-2xl mx-auto pt-2">
          <p
            className={`font-['Newsreader'] text-lg sm:text-xl leading-relaxed italic ${
              isLight ? 'text-neutral-700' : 'text-[#c2cbc5]'
            }`}
          >
            “{resumeData.about}”
          </p>
        </div>

        {/* Primary Call-to-Actions & Social Link Matrix */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
          {/* Switch to 3D Realm Button */}
          <button
            onClick={toggle3DMode}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-['Cinzel'] text-xs sm:text-sm font-bold tracking-widest uppercase transition-all shadow-md cursor-pointer ${
              isLight
                ? 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-neutral-900/10'
                : 'bg-[#c89658]/20 border border-[#c89658]/60 text-[#e4b77d] hover:bg-[#c89658] hover:text-[#0b0e0c]'
            }`}
          >
            <Box className="w-4 h-4 text-amber-400" />
            <span>Enter 3D Realm</span>
          </button>

          {/* Download PDF / Print Resume */}
          <button
            onClick={handleDownloadResume}
            className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-xl font-['Cinzel'] text-xs sm:text-sm font-semibold tracking-wider uppercase border transition-all cursor-pointer ${
              isLight
                ? 'bg-white border-neutral-300 hover:border-neutral-500 text-neutral-800 hover:bg-neutral-50'
                : 'bg-[#141b17] border-[#293730] hover:border-[#384840] text-[#f0ede6]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Curriculum Vitae</span>
          </button>

          {/* Social Badges */}
          <div className="flex items-center space-x-2 pl-2">
            <a
              href={resumeData.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub Profile"
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? 'border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:text-neutral-950 hover:bg-neutral-100'
                  : 'border-[#222e28] text-[#8e9f95] hover:border-[#384840] hover:text-[#f0ede6] hover:bg-[#18211c]'
              }`}
            >
              <GithubIcon className="w-4 h-4" />
            </a>

            <a
              href={resumeData.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn Profile"
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? 'border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:text-neutral-950 hover:bg-neutral-100'
                  : 'border-[#222e28] text-[#8e9f95] hover:border-[#384840] hover:text-[#f0ede6] hover:bg-[#18211c]'
              }`}
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>

            <a
              href={`mailto:${resumeData.email}`}
              aria-label="Email Missive"
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? 'border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:text-neutral-950 hover:bg-neutral-100'
                  : 'border-[#222e28] text-[#8e9f95] hover:border-[#384840] hover:text-[#f0ede6] hover:bg-[#18211c]'
              }`}
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. RUNIC RELICS & PROJECTS (#projects)
         ========================================================================= */}
      <section id="projects" className="space-y-8 scroll-mt-28">
        {/* Section Header */}
        <div className={`flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b ${sectionBorder} gap-4`}>
          <div>
            <div className={`flex items-center space-x-2 text-xs font-['JetBrains_Mono'] uppercase tracking-widest ${accentGold}`}>
              <span>◈</span>
              <span>01 · Artifacts & Selected Works</span>
            </div>
            <h2 className={`font-['Instrument_Serif'] text-4xl sm:text-5xl tracking-tight mt-1 ${textHead}`}>
              Runic Relics & Selected Works
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-['Cinzel'] tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? isLight
                      ? 'bg-neutral-900 text-white font-bold shadow-sm'
                      : 'bg-[#233129] border border-[#3e5648] text-[#f0ede6] font-bold shadow-sm'
                    : isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600'
                    : 'bg-[#141b17] hover:bg-[#1a231e] text-[#8e9f95] border border-[#222e28]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className={`group flex flex-col justify-between p-6 rounded-2xl transition-all duration-300 ${cardBg}`}
            >
              <div className="space-y-3">
                {/* Meta Header */}
                <div className="flex items-center justify-between text-xs font-['JetBrains_Mono']">
                  <span className={`tracking-wider font-semibold ${accentGold}`}>
                    {project.rune}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-[11px] font-['Cinzel'] uppercase tracking-wider ${
                      isLight
                        ? 'bg-neutral-100 border-neutral-300 text-neutral-700'
                        : 'bg-[#18211c] border-[#293730] text-[#a4b6ab]'
                    }`}
                  >
                    {project.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className={`font-['Instrument_Serif'] text-2xl sm:text-3xl tracking-tight leading-tight ${textHead}`}>
                  {project.title}
                </h3>

                {/* Summary / Description in Newsreader */}
                <p className={`font-['Newsreader'] text-base leading-relaxed ${textMuted}`}>
                  {project.description}
                </p>
              </div>

              {/* Card Footer: Tech Stack & Action Links */}
              <div className={`mt-6 pt-4 border-t ${sectionBorder} space-y-3.5`}>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className={`text-[11px] font-['JetBrains_Mono'] px-2 py-0.5 rounded border ${badgeBg}`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-3 text-xs font-['Cinzel'] tracking-wider pt-1">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isLight
                        ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                        : 'bg-[#c89658]/20 border border-[#c89658]/50 text-[#e4b77d] hover:bg-[#c89658] hover:text-[#0b0e0c]'
                    }`}
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg border transition-all ${
                      isLight
                        ? 'border-neutral-200 hover:border-neutral-400 text-neutral-700 hover:bg-neutral-50'
                        : 'border-[#222e28] text-[#8e9f95] hover:text-[#f0ede6] hover:border-[#384840] bg-[#141b17]'
                    }`}
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>Source</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =========================================================================
          3. TRAVELER’S CHRONICLE, SKILLS & HONORS (#resume)
         ========================================================================= */}
      <section id="resume" className="space-y-10 scroll-mt-28">
        {/* Section Header */}
        <div className={`pb-4 border-b ${sectionBorder}`}>
          <div className={`flex items-center space-x-2 text-xs font-['JetBrains_Mono'] uppercase tracking-widest ${accentGold}`}>
            <span>◈</span>
            <span>02 · Chronicle & Competencies</span>
          </div>
          <h2 className={`font-['Instrument_Serif'] text-4xl sm:text-5xl tracking-tight mt-1 ${textHead}`}>
            Traveler’s Chronicle & Skill Garden
          </h2>
        </div>

        {/* Experience Timeline */}
        <div className="space-y-6">
          <h3 className={`font-['Cinzel'] text-xs font-bold uppercase tracking-[0.25em] flex items-center space-x-2 ${accentGold}`}>
            <Briefcase className="w-4 h-4" />
            <span>Expeditions & Professional Milestones</span>
          </h3>

          <div className={`relative border-l ${sectionBorder} ml-3 pl-6 space-y-8`}>
            {resumeData.experience.map((exp, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline Waypoint Pin */}
                <div
                  className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 transition-all ${
                    isLight
                      ? 'bg-white border-neutral-800 group-hover:scale-125'
                      : 'bg-[#0f1412] border-[#526a5c] group-hover:border-[#c89658] group-hover:scale-125'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <h4 className={`font-['Instrument_Serif'] text-2xl sm:text-3xl tracking-tight ${textHead}`}>
                    {exp.role}
                  </h4>
                  <span className={`text-xs font-['JetBrains_Mono'] font-medium tracking-wider ${accentGold}`}>
                    {exp.period}
                  </span>
                </div>

                <p className={`font-['Cinzel'] text-xs tracking-wider mt-0.5 ${isLight ? 'text-neutral-500 font-semibold' : 'text-[#9bb1a4]'}`}>
                  {exp.company} · <span className="font-normal">{exp.location}</span>
                </p>

                <ul className="mt-3 space-y-2 text-sm font-['Newsreader'] leading-relaxed">
                  {exp.highlights.map((h, i) => (
                    <li key={i} className="flex items-start space-x-2.5">
                      <span className={`select-none mt-1 text-xs ${accentGold}`}>◈</span>
                      <span className={textMuted}>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* The Botanical Skill Garden */}
        <div className="space-y-4 pt-4">
          <h3 className={`font-['Cinzel'] text-xs font-bold uppercase tracking-[0.25em] flex items-center space-x-2 ${accentGold}`}>
            <Layers className="w-4 h-4" />
            <span>The Botanical Skill Garden</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resumeData.skillGarden.map((group, idx) => (
              <div key={idx} className={`p-5 rounded-xl transition-all ${cardBg}`}>
                <h4 className={`font-['Cinzel'] text-xs font-bold uppercase tracking-wider mb-3 ${accentGold}`}>
                  {group.category}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className={`text-xs font-['JetBrains_Mono'] px-2.5 py-1 rounded-md border transition-colors ${badgeBg}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education & Honors */}
        <div className="space-y-4 pt-2">
          <h3 className={`font-['Cinzel'] text-xs font-bold uppercase tracking-[0.25em] flex items-center space-x-2 ${accentGold}`}>
            <GraduationCap className="w-4 h-4" />
            <span>Academia & Honors</span>
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {resumeData.education.map((edu, idx) => (
              <div
                key={idx}
                className={`p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${cardBg}`}
              >
                <div>
                  <h4 className={`font-['Instrument_Serif'] text-xl sm:text-2xl ${textHead}`}>
                    {edu.degree}
                  </h4>
                  <p className={`font-['Newsreader'] text-sm italic ${textMuted}`}>
                    {edu.institution}
                  </p>
                </div>
                <span className={`text-xs font-['JetBrains_Mono'] font-medium ${accentGold}`}>
                  {edu.period}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. BIOLUMINESCENT GROVE NOTES & ESSAYS (#blog)
         ========================================================================= */}
      <section id="blog" className="space-y-8 scroll-mt-28">
        {/* Section Header */}
        <div className={`pb-4 border-b ${sectionBorder}`}>
          <div className={`flex items-center space-x-2 text-xs font-['JetBrains_Mono'] uppercase tracking-widest ${accentGold}`}>
            <span>◈</span>
            <span>03 · Field Notes & Musings</span>
          </div>
          <h2 className={`font-['Instrument_Serif'] text-4xl sm:text-5xl tracking-tight mt-1 ${textHead}`}>
            Bioluminescent Grove Notes
          </h2>
          <p className={`font-['Newsreader'] text-base italic mt-1 ${textMuted}`}>
            Fragments of craft, GPU shaders, and human interface philosophy.
          </p>
        </div>

        {/* Selected Blog Article Reading Drawer */}
        {selectedBlogArticle ? (
          <div className={`p-6 sm:p-8 rounded-2xl space-y-6 ${cardBg} animate-fadeIn`}>
            <button
              onClick={() => setSelectedBlogArticle(null)}
              className={`flex items-center space-x-2 text-xs font-['Cinzel'] tracking-wider uppercase font-bold cursor-pointer ${accentGold} hover:underline`}
            >
              <span>← Back to All Field Notes</span>
            </button>

            <div className={`pb-4 border-b ${sectionBorder} space-y-2`}>
              <h3 className={`font-['Instrument_Serif'] text-3xl sm:text-5xl leading-tight ${textHead}`}>
                {selectedBlogArticle.title}
              </h3>
              <div className="flex items-center space-x-4 text-xs font-['JetBrains_Mono'] text-neutral-500 dark:text-[#8e9f95]">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{selectedBlogArticle.date}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{selectedBlogArticle.readTime}</span>
                </span>
              </div>
            </div>

            <div className={`prose max-w-none font-['Newsreader'] text-lg sm:text-xl leading-relaxed whitespace-pre-line ${
              isLight ? 'text-neutral-800' : 'text-[#f0ede6]'
            }`}>
              {selectedBlogArticle.content}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedBlogArticle(null)}
                className={`text-xs font-['Cinzel'] tracking-wider uppercase font-semibold px-4 py-2 rounded-lg border cursor-pointer ${
                  isLight ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300' : 'bg-[#141b17] border-[#293730] text-[#f0ede6]'
                }`}
              >
                Close Tablet
              </button>
            </div>
          </div>
        ) : (
          /* Blog Post Cards List */
          <div className="grid grid-cols-1 gap-4">
            {blogPostsData.map((post) => (
              <article
                key={post.id}
                onClick={() => setSelectedBlogArticle(post)}
                className={`group p-6 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between ${cardBg}`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-['JetBrains_Mono'] text-neutral-500 dark:text-[#8e9f95]">
                    <span className="flex items-center space-x-1.5">
                      <Calendar className="w-3 h-3 text-neutral-400 dark:text-[#8e9f95]" />
                      <span>{post.date}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3 h-3 text-amber-700 dark:text-[#c89658]" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>

                  <h3
                    className={`font-['Instrument_Serif'] text-2xl sm:text-3xl leading-snug group-hover:translate-x-0.5 transition-transform ${textHead}`}
                  >
                    {post.title}
                  </h3>

                  <p className={`font-['Newsreader'] text-base leading-relaxed line-clamp-2 ${textMuted}`}>
                    {post.excerpt}
                  </p>
                </div>

                <div className={`mt-5 pt-3 border-t ${sectionBorder} flex items-center justify-between`}>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] font-['JetBrains_Mono'] px-2 py-0.5 rounded border ${badgeBg}`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span className={`inline-flex items-center space-x-1 text-xs font-['Cinzel'] tracking-wider font-bold ${accentGold} group-hover:translate-x-1 transition-transform`}>
                    <span>Read Tablet</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          5. THE WHISPERING WELL & DISPATCH (#contact)
         ========================================================================= */}
      <section id="contact" className="space-y-8 scroll-mt-28">
        {/* Section Header */}
        <div className={`pb-4 border-b ${sectionBorder}`}>
          <div className={`flex items-center space-x-2 text-xs font-['JetBrains_Mono'] uppercase tracking-widest ${accentGold}`}>
            <span>◈</span>
            <span>04 · Missives & Inquiry</span>
          </div>
          <h2 className={`font-['Instrument_Serif'] text-4xl sm:text-5xl tracking-tight mt-1 ${textHead}`}>
            The Whispering Well
          </h2>
          <p className={`font-['Newsreader'] text-base italic mt-1 ${textMuted}`}>
            Dispatch a coin into the subterranean well for collaborations, consulting, or creative ventures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left Column: Direct Communication Channels */}
          <div className="md:col-span-2 space-y-4">
            <div className={`p-5 rounded-2xl space-y-2 ${cardBg}`}>
              <h4 className={`font-['Cinzel'] text-xs font-bold uppercase tracking-wider ${accentGold}`}>
                Direct Transmission
              </h4>
              <p className={`font-['Newsreader'] text-sm leading-relaxed ${textMuted}`}>
                Whether you have an ambitious digital project or simply wish to discuss creative technology, my channels are open.
              </p>
            </div>

            <div className="space-y-2 font-['Cinzel'] text-xs tracking-wider">
              <a
                href={`mailto:${resumeData.email}`}
                className={`flex items-center space-x-3 p-3.5 rounded-xl border transition-all ${
                  isLight
                    ? 'bg-white border-neutral-200 text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50 shadow-sm'
                    : 'bg-[#141b17] border-[#222e28] text-[#f0ede6] hover:border-[#384840]'
                }`}
              >
                <Mail className="w-4 h-4 text-amber-600 dark:text-[#c89658]" />
                <span className="font-semibold">{resumeData.email}</span>
              </a>

              <a
                href={resumeData.github}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center space-x-3 p-3.5 rounded-xl border transition-all ${
                  isLight
                    ? 'bg-white border-neutral-200 text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50 shadow-sm'
                    : 'bg-[#141b17] border-[#222e28] text-[#f0ede6] hover:border-[#384840]'
                }`}
              >
                <GithubIcon className="w-4 h-4" />
                <span>github.com/profile</span>
              </a>

              <a
                href={resumeData.linkedin}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center space-x-3 p-3.5 rounded-xl border transition-all ${
                  isLight
                    ? 'bg-white border-neutral-200 text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50 shadow-sm'
                    : 'bg-[#141b17] border-[#222e28] text-[#f0ede6] hover:border-[#384840]'
                }`}
              >
                <LinkedinIcon className="w-4 h-4" />
                <span>linkedin.com/in/profile</span>
              </a>
            </div>
          </div>

          {/* Right Column: Inscribed Missive Form */}
          <div className="md:col-span-3">
            {contactSubmitted ? (
              <div
                className={`h-full flex flex-col items-center justify-center p-8 rounded-2xl text-center space-y-3 ${cardBg} animate-fadeIn`}
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-700 dark:text-[#82a390] animate-bounce" />
                <h4 className={`font-['Instrument_Serif'] text-3xl ${textHead}`}>
                  Missive Dispatched
                </h4>
                <p className={`font-['Newsreader'] text-base max-w-sm ${textMuted}`}>
                  Your inquiry has rippled across the water. I have received your dispatch and shall answer soon.
                </p>
                <button
                  onClick={() => {
                    setContactSubmitted(false)
                    setContactForm({ name: '', email: '', message: '' })
                  }}
                  className={`mt-2 font-['Cinzel'] text-xs font-bold uppercase tracking-wider ${accentGold} hover:underline cursor-pointer`}
                >
                  Send Another Missive
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className={`p-6 rounded-2xl space-y-4 ${cardBg}`}>
                <div>
                  <label className={`block text-xs font-['Cinzel'] tracking-wider uppercase mb-1.5 font-semibold ${isLight ? 'text-neutral-700' : 'text-[#a4b2aa]'}`}>
                    Your Traveler Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Hornet of Pharloom"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none ${
                      isLight
                        ? 'bg-neutral-50 border border-neutral-300 text-neutral-900 focus:border-neutral-900 focus:bg-white'
                        : 'bg-[#101513] border border-[#24312a] text-[#f0ede6] focus:border-[#c89658]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-['Cinzel'] tracking-wider uppercase mb-1.5 font-semibold ${isLight ? 'text-neutral-700' : 'text-[#a4b2aa]'}`}>
                    Contact Signal (Email)
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="traveler@realm.org"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none ${
                      isLight
                        ? 'bg-neutral-50 border border-neutral-300 text-neutral-900 focus:border-neutral-900 focus:bg-white'
                        : 'bg-[#101513] border border-[#24312a] text-[#f0ede6] focus:border-[#c89658]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-['Cinzel'] tracking-wider uppercase mb-1.5 font-semibold ${isLight ? 'text-neutral-700' : 'text-[#a4b2aa]'}`}>
                    Inscribed Missive
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Inscribe your thoughts, projects, or questions here..."
                    className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none resize-none ${
                      isLight
                        ? 'bg-neutral-50 border border-neutral-300 text-neutral-900 focus:border-neutral-900 focus:bg-white'
                        : 'bg-[#101513] border border-[#24312a] text-[#f0ede6] focus:border-[#c89658]'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-['Cinzel'] text-xs sm:text-sm font-bold tracking-[0.2em] uppercase transition-all shadow-md cursor-pointer ${
                    isLight
                      ? 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-neutral-900/15'
                      : 'bg-[#c89658]/20 border border-[#c89658]/60 text-[#e4b77d] hover:bg-[#c89658] hover:text-[#0b0e0c]'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Cast Into The Well</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FOOTER & RETURN TO 3D BEACON
         ========================================================================= */}
      <footer className={`pt-12 border-t ${sectionBorder} flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-['Cinzel'] tracking-widest`}>
        <p className={isLight ? 'text-neutral-500' : 'text-[#7e8f85]'}>
          ◈ THE MOSS GROTTO · REACT THREE FIBER & EDITORIAL TYPOGRAPHY ◈
        </p>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`flex items-center space-x-1 uppercase hover:underline cursor-pointer ${accentGold}`}
          >
            <span>Return to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggle3DMode}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border uppercase transition-all cursor-pointer ${
              isLight
                ? 'bg-neutral-900 text-white hover:bg-neutral-800 border-neutral-900'
                : 'bg-[#c89658]/20 text-[#e4b77d] border border-[#c89658]/50 hover:bg-[#c89658] hover:text-[#0b0e0c]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Enter 3D Realm</span>
          </button>
        </div>
      </footer>
    </main>
  )
}
