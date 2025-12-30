'use client'

import { useState } from 'react'
import { type SubConcept } from '../../lib/api-roadmap'
import ReactMarkdown from 'react-markdown'

interface SubConceptItemProps {
  subconcept: SubConcept
}

export default function SubConceptItem({ subconcept }: SubConceptItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-[#3f4449] rounded border border-white/10 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-zinc-400">
            {subconcept.order_index}
          </span>
          <h5 className="text-xs font-semibold text-white text-left leading-tight">{subconcept.title}</h5>
        </div>
        <svg
          className={`w-3 h-3 text-zinc-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-2 py-2 border-t border-white/10">
          <div className="prose prose-invert prose-xs max-w-none">
            <ReactMarkdown className="text-zinc-300 text-xs leading-relaxed">
              {subconcept.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}

