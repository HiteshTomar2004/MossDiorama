import React, { useState } from 'react'
import { OverlayWrapper } from './OverlayWrapper'
import { blogPostsData } from '../../data/blogPostsData'
import { Calendar, Clock, ChevronRight } from 'lucide-react'

export const OverlayBlog = () => {
  const [selectedPost, setSelectedPost] = useState(null)

  return (
    <OverlayWrapper title="Notes" symbol="◈">
      {selectedPost ? (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#15171b] border border-white/[0.06] space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] animate-fadeIn">
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center space-x-2 text-xs font-['Cinzel'] tracking-wider uppercase font-bold cursor-pointer text-[#d4a373] hover:underline"
          >
            <span>← Back to All Notes</span>
          </button>

          <div className="pb-4 border-b border-white/[0.08] space-y-2">
            <h3 className="font-['Instrument_Serif'] text-3xl sm:text-5xl leading-tight text-[#f4f4f6]">
              {selectedPost.title}
            </h3>
            <div className="flex items-center space-x-4 text-xs font-['JetBrains_Mono'] text-neutral-400">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{selectedPost.date}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[#d4a373]" />
                <span>{selectedPost.readTime}</span>
              </span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none font-['Newsreader'] text-lg sm:text-xl leading-relaxed whitespace-pre-line text-neutral-200">
            {selectedPost.content}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setSelectedPost(null)}
              className="text-xs font-['Cinzel'] tracking-wider uppercase font-semibold px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white cursor-pointer transition-all"
            >
              Close Note
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="font-['Newsreader'] text-base italic text-neutral-400">
            Technical writeups on systems architecture, machine learning, and engineering lessons.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {blogPostsData.map((post) => (
              <article
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="group p-6 rounded-2xl bg-[#15171b] border border-white/[0.06] hover:border-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-['JetBrains_Mono'] text-neutral-400">
                    <span className="flex items-center space-x-1.5">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      <span>{post.date}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3 h-3 text-[#d4a373]" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>

                  <h4 className="font-['Instrument_Serif'] text-2xl sm:text-3xl leading-snug group-hover:translate-x-0.5 text-[#f4f4f6] group-hover:text-white transition-transform">
                    {post.title}
                  </h4>

                  <p className="font-['Newsreader'] text-base leading-relaxed text-neutral-400 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span className="inline-flex items-center space-x-1 text-xs font-['Cinzel'] tracking-wider font-bold text-[#d4a373] group-hover:translate-x-1 transition-transform">
                    <span>Read Note</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </OverlayWrapper>
  )
}
