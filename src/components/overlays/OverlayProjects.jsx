import React, { useState } from 'react'
import { OverlayWrapper } from './OverlayWrapper'
import { projectsData } from '../../data/projectsData'
import { ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react'
import { GithubIcon } from '../common/Icons'

export const OverlayProjects = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showAll, setShowAll] = useState(false)

  const categories = ['All', 'Creative / 3D', 'Full-Stack / AI', 'Open Source']

  const filteredProjects = selectedCategory === 'All'
    ? projectsData
    : projectsData.filter((p) => p.category === selectedCategory)

  const INITIAL_PROJECT_COUNT = 6
  const visibleProjects = showAll
    ? filteredProjects
    : filteredProjects.slice(0, INITIAL_PROJECT_COUNT)
  const hasMoreProjects = filteredProjects.length > INITIAL_PROJECT_COUNT

  return (
    <OverlayWrapper title="Projects" symbol="◈">
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5 pb-4 border-b border-white/[0.08]">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-['Cinzel'] tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-white text-neutral-950 font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 relative">
        {visibleProjects.map((project) => (
          <article
            key={project.id}
            className="group flex flex-col justify-between p-6 rounded-2xl bg-[#15171b] border border-white/[0.06] hover:border-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-300"
          >
            <div className="space-y-3">
              {/* Meta Header */}
              <div className="flex items-center justify-between text-xs font-['JetBrains_Mono']">
                <span className="tracking-wider font-semibold text-[#d4a373]">
                  {project.rune}
                </span>
                <span className="text-[11px] font-['Cinzel'] uppercase tracking-wider text-neutral-400">
                  {project.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-['Instrument_Serif'] text-2xl sm:text-3xl tracking-tight leading-tight text-[#f4f4f6] group-hover:text-white transition-colors">
                {project.title}
              </h3>

              {/* Description */}
              <p className="font-['Newsreader'] text-base leading-relaxed text-neutral-300">
                {project.description}
              </p>
            </div>

            {/* Card Footer: Tech Stack & Action Links */}
            <div className="mt-6 pt-4 border-t border-white/[0.08] space-y-3.5">
              {/* Tech stack badges */}
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Action links */}
              <div className="flex items-center space-x-2.5 text-xs font-['Cinzel'] tracking-wider pt-1">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-950 hover:bg-white transition-all cursor-pointer"
                >
                  <span>Inspect</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>

                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.12] transition-all cursor-pointer"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>Source</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* News-site style Read More / Fade Overlay */}
      {hasMoreProjects && (
        <div className="relative pt-2">
          {!showAll ? (
            <div className="relative -mt-28 pt-28 pb-2 flex flex-col items-center justify-end bg-gradient-to-t from-[#0e0f12] via-[#0e0f12]/95 to-transparent pointer-events-none">
              <button
                onClick={() => setShowAll(true)}
                className="pointer-events-auto flex items-center space-x-2.5 px-8 py-2.5 rounded-2xl font-['Instrument_Serif'] text-xl sm:text-2xl tracking-tight bg-neutral-800/90 hover:bg-neutral-700 text-white shadow-2xl transition-all cursor-pointer"
              >
                <span>Read More Projects</span>
                <span className="text-xs font-['JetBrains_Mono'] opacity-70 ml-1">
                  (+{filteredProjects.length - INITIAL_PROJECT_COUNT})
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setShowAll(false)}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-neutral-300 hover:text-white font-['Cinzel'] text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <span>Show Less</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </OverlayWrapper>
  )
}
