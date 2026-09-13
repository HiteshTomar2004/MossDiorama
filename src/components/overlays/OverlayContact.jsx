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
    <OverlayWrapper title="Contact" symbol="✉">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left column: Direct channels */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-5 rounded-xl bg-grotto-900/70 border border-spore-mint/20">
            <h4 className="font-['Cinzel'] text-sm font-bold text-spore-mint uppercase tracking-widest flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Get In Touch</span>
            </h4>
            <p className="mt-2 text-xs font-['Alegreya'] text-bone-muted leading-relaxed">
              Whether you have an engineering challenge, an ambitious AI project, or wish to collaborate, feel free to reach out.
            </p>
          </div>

          <div className="space-y-3 font-['Cinzel'] text-xs tracking-wider">
            <a
              href={`mailto:${resumeData.email}`}
              className="flex items-center space-x-3 p-3 rounded-lg bg-grotto-950 border border-spore-mint/15 text-pale-bone hover:border-amber-fire hover:text-amber-glow transition-all"
            >
              <Mail className="w-4 h-4 text-amber-fire" />
              <span>{resumeData.email}</span>
            </a>

            <a
              href={resumeData.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-3 p-3 rounded-lg bg-grotto-950 border border-spore-mint/15 text-pale-bone hover:border-spore-mint hover:text-spore-mint transition-all"
            >
              <GithubIcon className="w-4 h-4 text-spore-mint" />
              <span>github.com/HiteshTomar2004</span>
            </a>

            <a
              href={resumeData.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-3 p-3 rounded-lg bg-grotto-950 border border-spore-mint/15 text-pale-bone hover:border-spore-mint hover:text-spore-mint transition-all"
            >
              <LinkedinIcon className="w-4 h-4 text-spore-mint" />
              <span>linkedin.com/in/hitesh-tomar</span>
            </a>
          </div>
        </div>

        {/* Right column: Interactive form */}
        <div className="md:col-span-3">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center p-8 rounded-xl bg-grotto-900/60 border border-spore-mint/30 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-spore-mint animate-bounce" />
              <h4 className="font-['Cinzel'] text-lg font-bold text-pale-bone">
                Message Sent
              </h4>
              <p className="text-xs text-bone-muted font-['Alegreya'] max-w-xs">
                Thank you for reaching out! I have received your message and will respond shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setFormData({ name: '', email: '', message: '' })
                }}
                className="mt-2 text-xs font-['Cinzel'] text-amber-fire hover:underline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-['Cinzel'] tracking-wider text-bone-muted mb-1.5 uppercase">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Smith"
                  className="w-full px-4 py-2.5 rounded-lg bg-grotto-950 border border-spore-mint/20 text-pale-bone text-sm focus:outline-none focus:border-amber-fire transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-['Cinzel'] tracking-wider text-bone-muted mb-1.5 uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-grotto-950 border border-spore-mint/20 text-pale-bone text-sm focus:outline-none focus:border-amber-fire transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-['Cinzel'] tracking-wider text-bone-muted mb-1.5 uppercase">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your message or inquiry here..."
                  className="w-full px-4 py-2.5 rounded-lg bg-grotto-950 border border-spore-mint/20 text-pale-bone text-sm focus:outline-none focus:border-amber-fire transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-amber-fire/20 border border-amber-fire text-amber-fire hover:bg-amber-fire hover:text-grotto-950 font-['Cinzel'] text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-[0_0_15px_rgba(223,157,82,0.2)] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </OverlayWrapper>
  )
}
