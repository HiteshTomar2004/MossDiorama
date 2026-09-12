import React from 'react'
import { projectsData } from '../../data/projectsData'
import { resumeData } from '../../data/resumeData'
import { blogPostsData } from '../../data/blogPostsData'
import { Sparkles, ExternalLink, Download, Briefcase, GraduationCap, Mail, ArrowUpRight } from 'lucide-react'
import { GithubIcon } from '../common/Icons'

export const FullReadingView = () => {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 py-24 space-y-24 text-pale-bone animate-fadeIn">
      {/* Hero Section */}
      <section className="text-center space-y-4 pt-10">
        <span className="text-xs font-['Cinzel'] tracking-[0.25em] text-amber-fire uppercase">
          ◈ Hallownest & Pharloom Craft ◈
        </span>
        <h1 className="font-['Cinzel_Decorative'] text-4xl sm:text-6xl font-extrabold tracking-wider text-pale-bone uppercase">
          {resumeData.name}
        </h1>
        <p className="font-['Cinzel'] text-lg text-spore-mint tracking-widest max-w-xl mx-auto">
          {resumeData.title}
        </p>
        <p className="font-['Alegreya'] text-base text-bone-muted max-w-2xl mx-auto italic leading-relaxed">
          "{resumeData.about}"
        </p>
      </section>

      {/* Projects Section */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 border-b border-spore-mint/20 pb-3">
          <span className="text-amber-fire">⚒</span>
          <h2 className="font-['Cinzel'] text-2xl font-bold tracking-[0.2em] uppercase">
            Runic Relics & Creations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projectsData.map((project) => (
            <div key={project.id} className="p-6 rounded-xl silksong-card border border-spore-mint/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-amber-fire font-mono">{project.rune}</span>
                  <span className="text-spore-mint font-['Cinzel'] text-[11px]">{project.category}</span>
                </div>
                <h3 className="font-['Cinzel'] text-lg font-bold">{project.title}</h3>
                <p className="mt-2 text-sm text-bone-muted font-['Alegreya']">{project.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-spore-mint/10 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="text-[10px] font-mono px-2 py-0.5 rounded bg-grotto-950 border border-spore-mint/15">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <a href={project.liveUrl} className="p-1.5 rounded bg-amber-fire/20 text-amber-fire hover:bg-amber-fire hover:text-grotto-950 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience & Resume Section */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 border-b border-spore-mint/20 pb-3">
          <span className="text-amber-fire">📜</span>
          <h2 className="font-['Cinzel'] text-2xl font-bold tracking-[0.2em] uppercase">
            Traveler’s Chronicle & Skills
          </h2>
        </div>

        <div className="space-y-6 border-l border-spore-mint/20 ml-3 pl-6">
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-grotto-950 border-2 border-spore-mint" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-['Cinzel'] text-base font-bold">{exp.role}</h3>
                <span className="text-xs font-mono text-amber-fire/80">{exp.period}</span>
              </div>
              <p className="text-xs text-spore-mint font-['Cinzel']">{exp.company} · {exp.location}</p>
              <ul className="mt-2 space-y-1 text-xs text-bone-muted font-['Alegreya']">
                {exp.highlights.map((h, i) => (
                  <li key={i}>◈ {h}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Blog & Articles */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 border-b border-spore-mint/20 pb-3">
          <span className="text-amber-fire">🍄</span>
          <h2 className="font-['Cinzel'] text-2xl font-bold tracking-[0.2em] uppercase">
            Bioluminescent Grove Notes
          </h2>
        </div>

        <div className="space-y-4">
          {blogPostsData.map((post) => (
            <div key={post.id} className="p-5 rounded-xl silksong-card border border-spore-mint/20">
              <div className="flex items-center justify-between text-xs text-bone-muted font-mono mb-1">
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="font-['Cinzel'] text-lg font-bold">{post.title}</h3>
              <p className="mt-2 text-sm text-bone-muted font-['Alegreya']">{post.excerpt}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-12 border-t border-spore-mint/20 text-center text-xs font-['Cinzel'] tracking-widest text-bone-muted/60">
        <p>◈ THE MOSS GROTTO · CRAFTED WITH REACT THREE FIBER & SILKSONG AESTHETICS ◈</p>
      </footer>
    </main>
  )
}
