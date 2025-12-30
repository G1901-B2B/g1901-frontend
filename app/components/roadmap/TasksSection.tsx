'use client'

import { type Task } from '../../lib/api-roadmap'

interface TasksSectionProps {
  tasks: Task[]
}

export default function TasksSection({ tasks }: TasksSectionProps) {
  const getTaskIcon = (taskType: Task['task_type']) => {
    switch (taskType) {
      case 'github_profile':
      case 'create_repo':
      case 'verify_commit':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        )
      case 'coding':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
    }
  }

  return (
    <div>
      <h4 className="text-xs font-semibold text-white mb-2">Tasks</h4>
      <div className="space-y-1.5">
        {tasks.map((task) => (
          <a
            key={task.task_id}
            href={`/workspace?task=${task.task_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 p-2 bg-[#3f4449] rounded border border-white/10 hover:border-white/20 transition-colors group"
          >
            <div className="text-zinc-400 group-hover:text-white transition-colors flex-shrink-0 mt-0.5 scale-75">
              {getTaskIcon(task.task_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h5 className="text-xs font-semibold text-white leading-tight">{task.title}</h5>
                <span className="text-[10px] px-1 py-0.5 bg-white/10 text-zinc-400 rounded">
                  {task.task_type}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">{task.description}</p>
            </div>
            <svg className="w-3 h-3 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  )
}

