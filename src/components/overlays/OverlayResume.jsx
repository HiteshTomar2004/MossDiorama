import React from 'react'
import { OverlayWrapper } from './OverlayWrapper'
import { resumeData } from '../../data/resumeData'
import { Download, Briefcase, GraduationCap, Compass, MapPin, Award } from 'lucide-react'

export const OverlayResume = () => {
  return (
    <OverlayWrapper title="Experience & Qualifications" symbol="◈">
      {/* Bio Header */}
      <div className="p-6 rounded-2xl bg-[#15171b] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div>
          <h3 className="font-['Instrument_Serif'] text-3xl sm:text-4xl text-[#f4f4f6] tracking-tight">
            {resumeData.name}
          </h3>
          <p className="font-['Newsreader'] text-lg italic text-neutral-400 mt-0.5">
            {resumeData.title}
          </p>
          <p className="flex items-center space-x-1.5 text-xs font-['JetBrains_Mono'] text-neutral-400 mt-2">
            <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
            <span>{resumeData.location}</span>
          </p>
        </div>

        <a
          href="/resume.pdf"
          download="Hitesh_Tomar_Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="self-start sm:self-center flex items-center space-x-2 px-4.5 py-2.5 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 font-['Cinzel'] text-xs font-semibold tracking-wider uppercase transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download CV (PDF)</span>
        </a>
      </div>

      {/* About statement */}
      <div className="p-6 rounded-2xl bg-[#15171b] border border-white/[0.06] space-y-2">
        <h4 className="text-xs font-['JetBrains_Mono'] uppercase tracking-widest text-[#d4a373] flex items-center space-x-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Personal Creed & Focus</span>
        </h4>
        <p className="font-['Newsreader'] text-base sm:text-lg italic text-neutral-300 leading-relaxed">
          "{resumeData.about}"
        </p>
      </div>

      {/* Experience Timeline */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-['JetBrains_Mono'] uppercase tracking-widest text-[#d4a373]">
          <Briefcase className="w-4 h-4" />
          <span>Professional Experience</span>
        </div>

        <div className="space-y-8 relative border-l border-white/[0.08] ml-3 pl-6 pt-2">
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="relative group">
              {/* Waypoint circle marker */}
              <div className="absolute -left-[30px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#d4a373] border-4 border-[#0e0f12] group-hover:scale-125 transition-transform" />

              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <h5 className="font-['Instrument_Serif'] text-2xl text-[#f4f4f6]">
                  {exp.role}
                </h5>
                <span className="text-xs font-['JetBrains_Mono'] text-neutral-400">
                  {exp.period}
                </span>
              </div>

              <p className="text-xs font-['Cinzel'] uppercase tracking-wider text-[#d4a373] mt-0.5">
                {exp.company} · <span className="text-neutral-400">{exp.location}</span>
              </p>

              <ul className="mt-3 space-y-2 text-sm sm:text-base font-['Newsreader'] text-neutral-300 leading-relaxed">
                {exp.highlights.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start space-x-2.5">
                    <span className="text-[#d4a373] select-none text-xs mt-1">◈</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Skills */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-['JetBrains_Mono'] uppercase tracking-widest text-[#d4a373]">
          <span>◈</span>
          <span>Technical Skills</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resumeData.skillGarden.map((cat, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#15171b] border border-white/[0.06] hover:border-white/[0.12] transition-all">
              <h5 className="font-['Cinzel'] text-xs font-bold text-neutral-300 tracking-wider uppercase mb-3 flex items-center justify-between">
                <span>{cat.category}</span>
                <span className="text-[10px] font-['JetBrains_Mono'] text-neutral-500 lowercase">{cat.skills.length} skills</span>
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-['JetBrains_Mono'] px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.06] text-neutral-300 hover:border-white/[0.15] hover:text-white transition-all"
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
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-['JetBrains_Mono'] uppercase tracking-widest text-[#d4a373]">
          <GraduationCap className="w-4 h-4" />
          <span>Education</span>
        </div>

        <div className="space-y-3">
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#15171b] border border-white/[0.06] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h5 className="font-['Instrument_Serif'] text-2xl text-[#f4f4f6]">
                  {edu.degree}
                </h5>
                <p className="font-['Newsreader'] text-base text-neutral-400 mt-0.5">{edu.institution}</p>
                {edu.coursework && (
                  <p className="font-['Newsreader'] text-sm text-neutral-400 mt-2">
                    <span className="font-semibold text-neutral-300 font-['Cinzel'] text-xs tracking-wider uppercase mr-1">Coursework:</span> {edu.coursework}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:items-end text-xs font-['JetBrains_Mono'] shrink-0 mt-1 sm:mt-0">
                {edu.period && (
                  <span className="text-neutral-400">{edu.period}</span>
                )}
                {edu.score && (
                  <span className="text-[#d4a373] font-semibold mt-1">{edu.score}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements & Certifications */}
      {resumeData.achievements && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-xs font-['JetBrains_Mono'] uppercase tracking-widest text-[#d4a373]">
            <Award className="w-4 h-4" />
            <span>Achievements & Certifications</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#15171b] border border-white/[0.06] space-y-3">
            {resumeData.achievements.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-sm sm:text-base font-['Newsreader'] text-neutral-300 leading-relaxed">
                <span className="text-[#d4a373] select-none mt-0.5 text-xs">◈</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </OverlayWrapper>
  )
}
