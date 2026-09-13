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
  ChevronDown,
  ChevronUp,
  Eye,
  MapPin,
  ArrowUp,
  BookOpen,
  Calendar,
  Clock,
  Layers,
  Code,
  Award
} from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '../common/Icons'

export const FullReadingView = () => {
  const is2DDarkMode = usePortfolioStore((s) => s.is2DDarkMode)
  const toggle3DMode = usePortfolioStore((s) => s.toggle3DMode)
  const isLight = !is2DDarkMode

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [selectedBlogArticle, setSelectedBlogArticle] = useState(null)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactSubmitted, setContactSubmitted] = useState(false)

  const categories = ['All', 'Creative / 3D', 'Full-Stack / AI', 'Open Source']
  const filteredProjects = selectedCategory === 'All'
    ? projectsData
    : projectsData.filter((p) => p.category === selectedCategory)

  const INITIAL_PROJECT_COUNT = 6
  const visibleProjects = showAllProjects
    ? filteredProjects
    : filteredProjects.slice(0, INITIAL_PROJECT_COUNT)
  const hasMoreProjects = filteredProjects.length > INITIAL_PROJECT_COUNT

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
  const sectionBorder = isLight ? 'border-neutral-200/90' : 'border-white/[0.08]'
  const cardBg = isLight
    ? 'bg-white border border-neutral-200/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] hover:border-neutral-400/80'
    : 'bg-[#15171b] border border-white/[0.06] hover:border-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
  const textMuted = isLight ? 'text-neutral-600' : 'text-neutral-400'
  const textHead = isLight ? 'text-neutral-950' : 'text-[#f4f4f6]'
  const accentGold = isLight ? 'text-amber-800' : 'text-[#d4a373]'
  const badgeBg = isLight
    ? 'bg-neutral-100 text-neutral-700'
    : 'bg-white/[0.06] text-neutral-300'

  return (
    <main
      className={`w-full max-w-4xl mx-auto px-4 sm:px-6 py-28 sm:py-32 space-y-28 transition-colors duration-300 selectable-prose relative z-10 ${
        isLight ? 'text-neutral-800' : 'text-[#f4f4f6]'
      }`}
    >
      {/* =========================================================================
          1. HERO & IDENTITY GATEWAY (#hearth)
         ========================================================================= */}
      <section id="hearth" className="pt-10 sm:pt-16 space-y-8 text-center scroll-mt-28">
        {/* Top Lore Monogram / Overline */}
        <div className="flex items-center justify-center space-x-3 text-xs font-['Cinzel'] tracking-[0.3em] uppercase">
          <span className={accentGold}>◈</span>
          <span className={isLight ? 'text-neutral-500 font-semibold' : 'text-[#d4a373]'}>
            Full-Stack & Applied AI Engineering
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
              isLight ? 'text-neutral-600' : 'text-neutral-400'
            }`}
          >
            {resumeData.title}
          </p>

          <p
            className={`text-xs font-['JetBrains_Mono'] uppercase tracking-widest pt-1 ${
              isLight ? 'text-neutral-500 font-medium' : 'text-neutral-400 font-medium'
            }`}
          >
            {resumeData.location}
          </p>
        </div>

        {/* Editorial Creed / Bio Statement */}
        <div className="max-w-2xl mx-auto pt-2">
          <p
            className={`font-['Newsreader'] text-lg sm:text-xl leading-relaxed italic ${
              isLight ? 'text-neutral-700' : 'text-neutral-300'
            }`}
          >
            “{resumeData.about}”
          </p>
        </div>

        {/* Primary Call-to-Actions & Social Link Matrix */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          {/* Switch to 3D Realm Button (Primary Action) */}
          <button
            onClick={toggle3DMode}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-['Cinzel'] text-xs sm:text-sm font-bold tracking-widest uppercase transition-all shadow-sm cursor-pointer ${
              isLight
                ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                : 'bg-neutral-100 hover:bg-white text-neutral-950'
            }`}
          >
            <Box className="w-4 h-4 text-amber-600" />
            <span>Enter 3D Realm</span>
          </button>

          {/* Download PDF / Print Resume (Secondary Action) */}
          <a
            href="/resume.pdf"
            download="Hitesh_Tomar_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-xl font-['Cinzel'] text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all cursor-pointer ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Curriculum Vitae</span>
          </a>

          {/* Social Badges - Borderless Squircles */}
          <div className="flex items-center space-x-2 pl-1">
            <a
              href={resumeData.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub Profile"
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-neutral-100'
              }`}
            >
              <GithubIcon className="w-4 h-4" />
            </a>

            <a
              href={resumeData.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn Profile"
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-neutral-100'
              }`}
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>

            <a
              href={`mailto:${resumeData.email}`}
              aria-label="Email Missive"
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-neutral-100'
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
              <span>01 · Projects</span>
            </div>
            <h2 className={`font-['Instrument_Serif'] text-4xl sm:text-5xl tracking-tight mt-1 ${textHead}`}>
              Projects
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
                      ? 'bg-neutral-900 text-white font-semibold shadow-sm'
                      : 'bg-white text-neutral-950 font-semibold shadow-sm'
                    : isLight
                    ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {visibleProjects.map((project) => (
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
                  <span className={`text-[11px] font-['Cinzel'] uppercase tracking-wider ${textMuted}`}>
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
                      className={`text-[11px] font-['JetBrains_Mono'] px-2 py-0.5 rounded ${badgeBg}`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-2.5 text-xs font-['Cinzel'] tracking-wider pt-1">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isLight
                        ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                        : 'bg-neutral-100 text-neutral-950 hover:bg-white'
                    }`}
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isLight
                        ? 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
                        : 'bg-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.12]'
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

        {/* News-Site Style "Read More" Fade-out Overlay */}
        {hasMoreProjects && (
          <div className="relative">
            {!showAllProjects ? (
              <div
                className={`relative -mt-36 pt-36 pb-2 flex flex-col items-center justify-end rounded-b-2xl pointer-events-none ${
                  isLight
                    ? 'bg-gradient-to-t from-[#fcfbf9] via-[#fcfbf9]/95 to-transparent'
                    : 'bg-gradient-to-t from-[#0e0f12] via-[#0e0f12]/95 to-transparent'
                }`}
              >
                <div className="pointer-events-auto flex flex-col items-center space-y-3 pt-4">
                  <button
                    onClick={() => setShowAllProjects(true)}
                    className={`group flex items-center space-x-2.5 px-8 py-3 rounded-2xl font-['Instrument_Serif'] text-2xl sm:text-3xl tracking-tight transition-all shadow-xl hover:-translate-y-0.5 cursor-pointer ${
                      isLight
                        ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-neutral-900/20'
                        : 'bg-neutral-800/90 hover:bg-neutral-700 text-white shadow-2xl'
                    }`}
                  >
                    <span>Read More Projects</span>
                    <span className="text-xs sm:text-sm font-['JetBrains_Mono'] font-normal opacity-70 ml-1">
                      (+{filteredProjects.length - INITIAL_PROJECT_COUNT})
                    </span>
                    <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                  </button>

                  <p className={`text-xs font-['Newsreader'] italic ${textMuted}`}>
                    Click to unveil the full engineering & research archive ({filteredProjects.length} selected works)
                  </p>
                </div>
              </div>
            ) : (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => {
                    setShowAllProjects(false)
                    const el = document.getElementById('projects')
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className={`group flex items-center space-x-2 px-5 py-2 rounded-xl font-['Instrument_Serif'] text-xl sm:text-2xl tracking-tight transition-all cursor-pointer ${
                    isLight
                      ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white'
                  }`}
                >
                  <span>Show Less</span>
                  <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* =========================================================================
          3. EXPERIENCE & QUALIFICATIONS (#resume)
         ========================================================================= */}
      <section id="resume" className="space-y-10 scroll-mt-28">
        {/* Section Header */}
        <div className={`pb-4 border-b ${sectionBorder}`}>
          <div className={`flex items-center space-x-2 text-xs font-['JetBrains_Mono'] uppercase tracking-widest ${accentGold}`}>
            <span>◈</span>
            <span>02 · Background</span>
          </div>
          <h2 className={`font-['Instrument_Serif'] text-4xl sm:text-5xl tracking-tight mt-1 ${textHead}`}>
            Experience & Qualifications
          </h2>
        </div>

        {/* Experience Timeline */}
        <div className="space-y-6">
          <h3 className={`font-['Cinzel'] text-xs font-bold uppercase tracking-[0.25em] flex items-center space-x-2 ${accentGold}`}>
            <Briefcase className="w-4 h-4" />
            <span>Professional Experience</span>
          </h3>

          <div className={`relative border-l ${sectionBorder} ml-3 pl-6 space-y-8`}>
            {resumeData.experience.map((exp, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline Waypoint Pin */}
                <div
                  className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 transition-all ${
                    isLight
                      ? 'bg-white border-neutral-800 group-hover:scale-125'
                      : 'bg-[#0e0f12] border-[#373a45] group-hover:border-[#d4a373] group-hover:scale-125'
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

                <p className={`font-['Cinzel'] text-xs tracking-wider mt-0.5 ${isLight ? 'text-neutral-500 font-semibold' : 'text-neutral-400 font-medium'}`}>
                  {exp.company} · <span className="font-normal">{exp.location}</span>
                </p>

                <ul className="mt-3 space-y-2 text-sm font-['Newsreader'] leading-relaxed">
                  {exp.highlights.map((h, i) => (
                    <li key={i} className="flex items-start space-x-2.5">
                      <span className={`select-none mt-1 text-xs ${accentGold}`}>◈</span>
                      <span className={isLight ? 'text-neutral-700' : 'text-neutral-300'}>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Skills */}
        <div className="space-y-4 pt-4">
          <h3 className={`font-['Cinzel'] text-xs font-bold uppercase tracking-[0.25em] flex items-center space-x-2 ${accentGold}`}>
            <Layers className="w-4 h-4" />
            <span>Technical Skills</span>
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
                      className={`text-xs font-['JetBrains_Mono'] px-2.5 py-1 rounded-md transition-colors ${badgeBg}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="space-y-4 pt-2">
          <h3 className={`font-['Cinzel'] text-xs font-bold uppercase tracking-[0.25em] flex items-center space-x-2 ${accentGold}`}>
            <GraduationCap className="w-4 h-4" />
            <span>Education</span>
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {resumeData.education.map((edu, idx) => (
              <div
                key={idx}
                className={`p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-2 ${cardBg}`}
              >
                <div>
                  <h4 className={`font-['Instrument_Serif'] text-xl sm:text-2xl ${textHead}`}>
                    {edu.degree}
                  </h4>
                  <p className={`font-['Newsreader'] text-sm italic ${textMuted}`}>
                    {edu.institution}
                  </p>
                  {edu.coursework && (
                    <p className="text-xs font-['Newsreader'] text-amber-700 dark:text-[#d4a373] mt-1 italic">
                      <span className="font-semibold not-italic">Coursework:</span> {edu.coursework}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:items-end text-xs font-['JetBrains_Mono'] shrink-0 mt-1 sm:mt-0">
                  {edu.period && (
                    <span className={`leading-tight ${textMuted}`}>
                      {edu.period}
                    </span>
                  )}
                  {edu.score && (
                    <span className={`font-medium leading-tight mt-0.5 ${accentGold}`}>
                      {edu.score}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements & Certifications */}
        {resumeData.achievements && (
          <div className="space-y-4 pt-2">
            <h3 className={`font-['Cinzel'] text-xs font-bold uppercase tracking-[0.25em] flex items-center space-x-2 ${accentGold}`}>
              <Award className="w-4 h-4" />
              <span>Achievements & Certifications</span>
            </h3>

            <div className={`p-5 rounded-xl space-y-3 ${cardBg}`}>
              {resumeData.achievements.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-sm font-['Newsreader'] leading-relaxed">
                  <span className={`select-none mt-0.5 text-xs ${accentGold}`}>◈</span>
                  <span className={isLight ? 'text-neutral-700' : 'text-neutral-300'}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          4. NOTES (#blog)
         ========================================================================= */}
      <section id="blog" className="space-y-8 scroll-mt-28">
        {/* Section Header */}
        <div className={`pb-4 border-b ${sectionBorder}`}>
          <div className={`flex items-center space-x-2 text-xs font-['JetBrains_Mono'] uppercase tracking-widest ${accentGold}`}>
            <span>◈</span>
            <span>03 · Writing</span>
          </div>
          <h2 className={`font-['Instrument_Serif'] text-4xl sm:text-5xl tracking-tight mt-1 ${textHead}`}>
            Notes
          </h2>
          <p className={`font-['Newsreader'] text-base italic mt-1 ${textMuted}`}>
            Technical writeups on systems architecture, machine learning, and engineering lessons.
          </p>
        </div>

        {/* Selected Blog Article Reading Drawer */}
        {selectedBlogArticle ? (
          <div className={`p-6 sm:p-8 rounded-2xl space-y-6 ${cardBg} animate-fadeIn`}>
            <button
              onClick={() => setSelectedBlogArticle(null)}
              className={`flex items-center space-x-2 text-xs font-['Cinzel'] tracking-wider uppercase font-bold cursor-pointer ${accentGold} hover:underline`}
            >
              <span>← Back to All Notes</span>
            </button>

            <div className={`pb-4 border-b ${sectionBorder} space-y-2`}>
              <h3 className={`font-['Instrument_Serif'] text-3xl sm:text-5xl leading-tight ${textHead}`}>
                {selectedBlogArticle.title}
              </h3>
              <div className="flex items-center space-x-4 text-xs font-['JetBrains_Mono'] text-neutral-500 dark:text-neutral-400">
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
              isLight ? 'text-neutral-800' : 'text-neutral-200'
            }`}>
              {selectedBlogArticle.content}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedBlogArticle(null)}
                className={`text-xs font-['Cinzel'] tracking-wider uppercase font-semibold px-4 py-2 rounded-lg cursor-pointer ${
                  isLight ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800' : 'bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white'
                }`}
              >
                Close Note
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
                  <div className="flex items-center justify-between text-xs font-['JetBrains_Mono'] text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center space-x-1.5">
                      <Calendar className="w-3 h-3 text-neutral-400 dark:text-neutral-400" />
                      <span>{post.date}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3 h-3 text-amber-700 dark:text-[#d4a373]" />
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
                        className={`text-[10px] font-['JetBrains_Mono'] px-2 py-0.5 rounded ${badgeBg}`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span className={`inline-flex items-center space-x-1 text-xs font-['Cinzel'] tracking-wider font-bold ${accentGold} group-hover:translate-x-1 transition-transform`}>
                    <span>Read Note</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          5. CONTACT (#contact)
         ========================================================================= */}
      <section id="contact" className="space-y-8 scroll-mt-28">
        {/* Section Header */}
        <div className={`pb-4 border-b ${sectionBorder}`}>
          <div className={`flex items-center space-x-2 text-xs font-['JetBrains_Mono'] uppercase tracking-widest ${accentGold}`}>
            <span>◈</span>
            <span>04 · Contact</span>
          </div>
          <h2 className={`font-['Instrument_Serif'] text-4xl sm:text-5xl tracking-tight mt-1 ${textHead}`}>
            Contact
          </h2>
          <p className={`font-['Newsreader'] text-base italic mt-1 ${textMuted}`}>
            Have an engineering challenge, an ambitious project, or wish to collaborate? Feel free to reach out.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left Column: Direct Communication Channels */}
          <div className="md:col-span-2 space-y-4">
            <div className={`p-5 rounded-2xl space-y-2 ${cardBg}`}>
              <h4 className={`font-['Cinzel'] text-xs font-bold uppercase tracking-wider ${accentGold}`}>
                Get In Touch
              </h4>
              <p className={`font-['Newsreader'] text-sm leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                Whether you have an ambitious AI project, research opportunity, or simply wish to connect, my inbox is open.
              </p>
            </div>

            <div className="space-y-2 font-['Cinzel'] text-xs tracking-wider">
              <a
                href={`mailto:${resumeData.email}`}
                className={`flex items-center space-x-3 p-3.5 rounded-xl transition-all ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4 text-amber-600 dark:text-[#d4a373]" />
                <span className="font-semibold">{resumeData.email}</span>
              </a>

              <a
                href={resumeData.github}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center space-x-3 p-3.5 rounded-xl transition-all ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white'
                }`}
              >
                <GithubIcon className="w-4 h-4" />
                <span>github.com/HiteshTomar2004</span>
              </a>

              <a
                href={resumeData.linkedin}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center space-x-3 p-3.5 rounded-xl transition-all ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white'
                }`}
              >
                <LinkedinIcon className="w-4 h-4" />
                <span>linkedin.com/in/hitesh-tomar</span>
              </a>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="md:col-span-3">
            {contactSubmitted ? (
              <div
                className={`h-full flex flex-col items-center justify-center p-8 rounded-2xl text-center space-y-3 ${cardBg} animate-fadeIn`}
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                <h4 className={`font-['Instrument_Serif'] text-3xl ${textHead}`}>
                  Message Sent
                </h4>
                <p className={`font-['Newsreader'] text-base max-w-sm ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                  Thank you for reaching out! I have received your message and will get back to you shortly.
                </p>
                <button
                  onClick={() => {
                    setContactSubmitted(false)
                    setContactForm({ name: '', email: '', message: '' })
                  }}
                  className={`mt-2 font-['Cinzel'] text-xs font-bold uppercase tracking-wider ${accentGold} hover:underline cursor-pointer`}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className={`p-6 rounded-2xl space-y-4 ${cardBg}`}>
                <div>
                  <label className={`block text-xs font-['Cinzel'] tracking-wider uppercase mb-1.5 font-semibold ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Alex Smith"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none ${
                      isLight
                        ? 'bg-neutral-50 border border-neutral-300 text-neutral-900 focus:border-neutral-900 focus:bg-white'
                        : 'bg-white/[0.04] border border-white/[0.08] text-white focus:border-neutral-400 focus:bg-white/[0.07]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-['Cinzel'] tracking-wider uppercase mb-1.5 font-semibold ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="alex@example.com"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none ${
                      isLight
                        ? 'bg-neutral-50 border border-neutral-300 text-neutral-900 focus:border-neutral-900 focus:bg-white'
                        : 'bg-white/[0.04] border border-white/[0.08] text-white focus:border-neutral-400 focus:bg-white/[0.07]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-['Cinzel'] tracking-wider uppercase mb-1.5 font-semibold ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Write your message or inquiry here..."
                    className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none resize-none ${
                      isLight
                        ? 'bg-neutral-50 border border-neutral-300 text-neutral-900 focus:border-neutral-900 focus:bg-white'
                        : 'bg-white/[0.04] border border-white/[0.08] text-white focus:border-neutral-400 focus:bg-white/[0.07]'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-['Cinzel'] text-xs sm:text-sm font-bold tracking-[0.2em] uppercase transition-all shadow-sm cursor-pointer ${
                    isLight
                      ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                      : 'bg-neutral-100 hover:bg-white text-neutral-950 font-bold'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
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
        <p className={isLight ? 'text-neutral-500' : 'text-neutral-400'}>
          HITESH TOMAR · FULL-STACK & APPLIED AI ENGINEER
        </p>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg uppercase hover:bg-white/[0.06] transition-colors cursor-pointer ${accentGold}`}
          >
            <span>Return to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggle3DMode}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl uppercase font-semibold transition-all cursor-pointer ${
              isLight
                ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                : 'bg-neutral-100 text-neutral-950 hover:bg-white'
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
