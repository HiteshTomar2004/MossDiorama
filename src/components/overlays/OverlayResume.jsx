import React from 'react'
import { OverlayWrapper } from './OverlayWrapper'
import { resumeData } from '../../data/resumeData'
import { Download, Briefcase, GraduationCap, Compass, MapPin } from 'lucide-react'

export const OverlayResume = () => {
  return (
    <OverlayWrapper title="Traveler's Pavilion & Chronicle" symbol="📜">
      {/* Bio Header */}
      <div className="p-6 rounded-xl bg-grotto-900/60 border border-spore-mint/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-['Cinzel'] text-2xl font-bold text-pale-bone">
            {resumeData.name}
          </h3>
          <p className="text-amber-fire font-['Cinzel'] text-sm tracking-wider mt-1">
            {resumeData.title}
          </p>
          <p className="flex items-center space-x-1.5 text-xs text-bone-muted mt-2 font-['Alegreya']">
            <MapPin className="w-3.5 h-3.5 text-spore-mint" />
            <span>{resumeData.location}</span>
          </p>
        </div>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            alert('Resume PDF download initiated.')
          }}
          className="self-start sm:self-center flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-amber-fire/20 border border-amber-fire text-amber-fire hover:bg-amber-fire hover:text-grotto-950 font-['Cinzel'] text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(223,157,82,0.2)] cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Scroll (PDF)</span>
        </a>
      </div>

      {/* About statement */}
      <div className="p-5 rounded-xl bg-grotto-950/60 border border-spore-mint/15">
        <h4 className="font-['Cinzel'] text-xs uppercase tracking-[0.2em] text-spore-mint mb-2 flex items-center space-x-2">
          <Compass className="w-3.5 h-3.5" />
          <span>The Traveler’s Creed</span>
        </h4>
        <p className="text-sm font-['Alegreya'] text-pale-bone/90 leading-relaxed italic">
          "{resumeData.about}"
        </p>
      </div>

      {/* Experience Timeline */}
      <div>
        <h4 className="font-['Cinzel'] text-sm uppercase tracking-[0.2em] text-amber-fire mb-4 flex items-center space-x-2">
          <Briefcase className="w-4 h-4" />
          <span>Expeditions & Milestones</span>
        </h4>

        <div className="space-y-6 relative border-l border-spore-mint/20 ml-3 pl-6">
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="relative group">
              {/* Waypoint circle marker */}
              <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-grotto-950 border-2 border-spore-mint group-hover:border-amber-fire group-hover:scale-125 transition-all" />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h5 className="font-['Cinzel'] text-base font-bold text-pale-bone">
                  {exp.role}
                </h5>
                <span className="text-xs font-mono text-amber-fire/80 tracking-wider">
                  {exp.period}
                </span>
              </div>

              <p className="text-xs text-spore-mint font-['Cinzel'] tracking-wider mt-0.5">
                {exp.company} · <span className="text-bone-muted">{exp.location}</span>
              </p>

              <ul className="mt-2.5 space-y-1.5 text-xs text-bone-muted font-['Alegreya'] leading-relaxed">
                {exp.highlights.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start space-x-2">
                    <span className="text-amber-fire select-none">◈</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* The Botanical Skill Garden */}
      <div>
        <h4 className="font-['Cinzel'] text-sm uppercase tracking-[0.2em] text-spore-mint mb-4 flex items-center space-x-2">
          <span>◈ The Botanical Skill Garden ◈</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resumeData.skillGarden.map((cat, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-grotto-900/60 border border-spore-mint/15">
              <h5 className="font-['Cinzel'] text-xs font-bold text-amber-fire tracking-wider uppercase mb-3">
                {cat.category}
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2.5 py-1 rounded-md bg-grotto-950 border border-spore-mint/20 text-pale-bone/90 hover:border-spore-mint/50 transition-colors"
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
      <div>
        <h4 className="font-['Cinzel'] text-sm uppercase tracking-[0.2em] text-bone-muted mb-3 flex items-center space-x-2">
          <GraduationCap className="w-4 h-4 text-amber-fire" />
          <span>Academia & Honors</span>
        </h4>

        {resumeData.education.map((edu, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-grotto-900/40 border border-spore-mint/15 flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h5 className="font-['Cinzel'] text-sm font-bold text-pale-bone">
                {edu.degree}
              </h5>
              <p className="text-xs text-bone-muted mt-0.5">{edu.institution}</p>
            </div>
            <span className="text-xs font-mono text-amber-fire mt-1 sm:mt-0">{edu.period}</span>
          </div>
        ))}
      </div>
    </OverlayWrapper>
  )
}
