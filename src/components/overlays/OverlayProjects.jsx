import React, { useState } from 'react'
import { OverlayWrapper } from './OverlayWrapper'
import { projectsData } from '../../data/projectsData'
import { ExternalLink, Sparkles } from 'lucide-react'
import { GithubIcon } from '../common/Icons'

export const OverlayProjects = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Creative / 3D', 'Full-Stack / AI', 'Open Source']

  const filteredProjects = selectedCategory === 'All'
    ? projectsData
    : projectsData.filter((p) => p.category === selectedCategory)

  return (
    <OverlayWrapper title="Runic Archive & Creations" symbol="⚒">
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-spore-mint/15">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-['Cinzel'] tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-fire/20 border border-amber-fire text-amber-fire shadow-[0_0_12px_rgba(223,157,82,0.3)]'
                : 'bg-grotto-900/60 border border-spore-mint/15 text-bone-muted hover:text-pale-bone hover:border-spore-mint/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="group flex flex-col justify-between p-5 rounded-xl bg-grotto-900/70 border border-spore-mint/20 hover:border-amber-fire/60 hover:shadow-[0_0_20px_rgba(223,157,82,0.15)] transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono tracking-widest text-amber-fire/90">
                  {project.rune}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-spore-mint/10 border border-spore-mint/30 text-spore-mint font-['Cinzel'] text-[11px] tracking-wider">
                  {project.category}
                </span>
              </div>

              <h3 className="font-['Cinzel'] text-lg font-bold text-pale-bone group-hover:text-amber-glow transition-colors">
                {project.title}
              </h3>

              <p className="mt-2 text-sm text-bone-muted/90 font-['Alegreya'] leading-relaxed">
                {project.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-spore-mint/10 space-y-4">
              {/* Tech stack badges */}
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-grotto-950/80 border border-spore-mint/15 text-pale-bone/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Action links */}
              <div className="flex items-center space-x-3 text-xs font-['Cinzel'] tracking-wider">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-fire/15 border border-amber-fire/40 text-amber-fire hover:bg-amber-fire hover:text-grotto-950 transition-all font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inspect Relic</span>
                </a>

                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-grotto-950 border border-spore-mint/20 text-bone-muted hover:text-pale-bone hover:border-spore-mint/50 transition-all"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>Source</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </OverlayWrapper>
  )
}
