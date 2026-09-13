import React, { useState } from 'react'
import { OverlayWrapper } from './OverlayWrapper'
import { Mail, Send, Sparkles, CheckCircle2 } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '../common/Icons'
import { resumeData } from '../../data/resumeData'

export const OverlayContact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return
    setSubmitted(true)
  }

  return (
    <OverlayWrapper title="Contact" symbol="◈">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left column: Direct channels */}
        <div className="md:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-[#15171b] border border-white/[0.06] space-y-2 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <h4 className="font-['Cinzel'] text-xs font-bold uppercase tracking-wider text-[#d4a373] flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get In Touch</span>
            </h4>
            <p className="font-['Newsreader'] text-sm leading-relaxed text-neutral-300">
              Whether you have an ambitious AI project, research opportunity, or simply wish to connect, my inbox is open.
            </p>
          </div>

          <div className="space-y-2 font-['Cinzel'] text-xs tracking-wider">
            <a
              href={`mailto:${resumeData.email}`}
              className="flex items-center space-x-3 p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.06] transition-all"
            >
              <Mail className="w-4 h-4 text-[#d4a373]" />
              <span className="font-semibold">{resumeData.email}</span>
            </a>

            <a
              href={resumeData.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-3 p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.06] transition-all"
            >
              <GithubIcon className="w-4 h-4" />
              <span>github.com/HiteshTomar2004</span>
            </a>

            <a
              href={resumeData.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-3 p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.06] transition-all"
            >
              <LinkedinIcon className="w-4 h-4" />
              <span>linkedin.com/in/hitesh-tomar</span>
            </a>
          </div>
        </div>

        {/* Right column: Interactive form */}
        <div className="md:col-span-3">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center p-8 rounded-2xl bg-[#15171b] border border-white/[0.06] text-center space-y-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)] animate-fadeIn">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
              <h4 className="font-['Instrument_Serif'] text-3xl text-[#f4f4f6]">
                Message Sent
              </h4>
              <p className="font-['Newsreader'] text-base text-neutral-300 max-w-sm">
                Thank you for reaching out! I have received your message and will get back to you shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setFormData({ name: '', email: '', message: '' })
                }}
                className="mt-2 font-['Cinzel'] text-xs font-bold uppercase tracking-wider text-[#d4a373] hover:underline cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#15171b] border border-white/[0.06] space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <div>
                <label className="block text-xs font-['Cinzel'] tracking-wider uppercase mb-1.5 font-semibold text-neutral-300">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Smith"
                  className="w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none bg-white/[0.04] border border-white/[0.08] text-white focus:border-neutral-400 focus:bg-white/[0.07] placeholder:text-neutral-500"
                />
              </div>

              <div>
                <label className="block text-xs font-['Cinzel'] tracking-wider uppercase mb-1.5 font-semibold text-neutral-300">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none bg-white/[0.04] border border-white/[0.08] text-white focus:border-neutral-400 focus:bg-white/[0.07] placeholder:text-neutral-500"
                />
              </div>

              <div>
                <label className="block text-xs font-['Cinzel'] tracking-wider uppercase mb-1.5 font-semibold text-neutral-300">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your message or inquiry here..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none bg-white/[0.04] border border-white/[0.08] text-white focus:border-neutral-400 focus:bg-white/[0.07] placeholder:text-neutral-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 font-['Cinzel'] text-xs sm:text-sm font-bold tracking-[0.2em] uppercase transition-all shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </OverlayWrapper>
  )
}
