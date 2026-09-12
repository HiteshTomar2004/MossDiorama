import React, { useState } from 'react'
import { OverlayWrapper } from './OverlayWrapper'
import { blogPostsData } from '../../data/blogPostsData'
import { BookOpen, Calendar, Clock, ChevronRight } from 'lucide-react'

export const OverlayBlog = () => {
  const [selectedPost, setSelectedPost] = useState(null)

  return (
    <OverlayWrapper title="Bioluminescent Grove & Field Notes" symbol="🍄">
      {selectedPost ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center space-x-2 text-xs font-['Cinzel'] tracking-wider text-amber-fire hover:text-amber-glow uppercase cursor-pointer"
          >
            <span>← Back to Grove Notes</span>
          </button>

          <div className="border-b border-spore-mint/20 pb-4">
            <h3 className="font-['Cinzel'] text-2xl font-bold text-pale-bone leading-tight">
              {selectedPost.title}
            </h3>
            <div className="flex items-center space-x-4 mt-2 text-xs text-bone-muted font-mono">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-spore-mint" />
                <span>{selectedPost.date}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-fire" />
                <span>{selectedPost.readTime}</span>
              </span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-pale-bone/90 font-['Alegreya'] text-base leading-relaxed whitespace-pre-line">
            {selectedPost.content}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-xs text-bone-muted font-['Cinzel'] tracking-widest uppercase">
            ◈ Fragments of Craft, Shaders & Design Philosophy ◈
          </p>

          <div className="grid grid-cols-1 gap-4">
            {blogPostsData.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="group p-5 rounded-xl bg-grotto-900/60 border border-spore-mint/15 hover:border-spore-mint/50 hover:bg-grotto-900/90 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-bone-muted font-mono mb-2">
                    <span className="flex items-center space-x-1.5">
                      <Calendar className="w-3 h-3 text-spore-mint" />
                      <span>{post.date}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3 h-3 text-amber-fire" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>

                  <h4 className="font-['Cinzel'] text-lg font-bold text-pale-bone group-hover:text-spore-mint transition-colors">
                    {post.title}
                  </h4>

                  <p className="mt-2 text-sm text-bone-muted font-['Alegreya'] leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-spore-mint/10 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-grotto-950 border border-spore-mint/10 text-spore-mint/80"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span className="flex items-center space-x-1 text-xs font-['Cinzel'] tracking-wider text-amber-fire group-hover:translate-x-1 transition-transform">
                    <span>Read Tablet</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </OverlayWrapper>
  )
}
