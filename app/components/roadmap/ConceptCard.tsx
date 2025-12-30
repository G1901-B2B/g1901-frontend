'use client'

import { type Concept } from '../../lib/api-roadmap'

interface ConceptCardProps {
  concept: Concept
  onClick: () => void
  completed?: boolean
}

export default function ConceptCard({ concept, onClick, completed = false }: ConceptCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-2 rounded border transition-all duration-200 text-left
        ${completed 
          ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50' 
          : 'bg-[#2f3338] border-white/10 hover:border-white/20'
        }
      `}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-[10px] font-medium text-zinc-400">
          {concept.order_index}.{concept.title.split(' ')[0]}
        </span>
        {completed && (
          <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <h4 className="text-xs font-semibold text-white mb-0.5 leading-tight">{concept.title}</h4>
      {concept.description && (
        <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">{concept.description}</p>
      )}
    </button>
  )
}

