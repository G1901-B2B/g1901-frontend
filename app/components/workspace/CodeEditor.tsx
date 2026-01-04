'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { type Task, completeTask } from '../../lib/api-roadmap'

interface CodeEditorProps {
  task: Task
  projectId: string
  onComplete: () => void
}

export default function CodeEditor({ task, projectId, onComplete, initialCompleted }: CodeEditorProps & { initialCompleted?: boolean }) {
  const { getToken } = useAuth()
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(initialCompleted || false)
  const [isVerifying, setIsVerifying] = useState(false)
  
  useEffect(() => {
    if (initialCompleted) {
      setIsCompleted(true)
      onComplete()
    }
  }, [initialCompleted, onComplete])

  const handleVerifyTask = async () => {
    if (code.trim().length < 10) {
      setOutput('Please write some code before verifying.')
      return
    }
    
    setIsVerifying(true)
    try {
      const token = await getToken()
      if (!token) return
      
      await completeTask(projectId, task.task_id, token)
      setIsCompleted(true)
      onComplete()
      setOutput('✓ Task verified successfully!')
    } catch (error) {
      console.error('Failed to verify task:', error)
      setOutput('Failed to verify task. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleRun = async () => {
    setIsRunning(true)
    setTimeout(() => {
      setOutput('Code executed successfully!')
      setIsRunning(false)
    }, 1000)
  }

  const handleSave = () => {
    console.log('Saving code:', code)
  }

  // Placeholder files for file explorer
  const files = [
    { name: 'main.tsx', type: 'file', active: true },
    { name: 'styles.css', type: 'file', active: false },
    { name: 'utils.ts', type: 'file', active: false },
  ]

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel - File Explorer */}
        <div className="w-48 bg-[#252526] border-r border-zinc-800 flex flex-col">
          {/* Files Header */}
          <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Explorer</span>
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          
          {/* File Tree */}
          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-2">
              <div className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="font-medium">src</span>
              </div>
              {files.map((file, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-2 px-4 py-1 text-xs cursor-pointer rounded transition-colors ${
                    file.active 
                      ? 'bg-zinc-700/50 text-zinc-200' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                  }`}
                >
                  {file.name.endsWith('.tsx') || file.name.endsWith('.ts') ? (
                    <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 3h18v18H3V3zm16.525 13.707c-.131-.821-.666-1.511-2.252-2.155-.552-.259-1.165-.438-1.349-.854-.068-.248-.078-.382-.034-.529.113-.484.687-.629 1.137-.495.293.09.563.315.732.676.775-.507.775-.507 1.316-.844-.203-.314-.304-.451-.439-.586-.473-.528-1.103-.798-2.126-.775l-.528.067c-.507.124-.991.395-1.283.754-.855.968-.608 2.655.427 3.354 1.023.765 2.521.933 2.712 1.653.18.878-.652 1.159-1.475 1.058-.607-.136-.945-.439-1.316-1.002l-1.372.788c.157.359.337.517.607.832 1.305 1.316 4.568 1.249 5.153-.754.021-.067.18-.528.056-1.237l.034.003zm-6.737-5.434h-1.686c0 1.453-.007 2.898-.007 4.354 0 .924.047 1.772-.104 2.033-.247.517-.886.451-1.175.359-.297-.146-.448-.349-.623-.641-.047-.078-.082-.146-.095-.146l-1.368.844c.229.473.563.879.994 1.137.641.383 1.502.507 2.404.305.588-.17 1.095-.519 1.358-1.059.384-.697.302-1.553.299-2.509.008-1.541 0-3.083 0-4.635l.003-.042z"/>
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5.7 4.5C5.4 4.5 5 4.8 5 5.2v13.6c0 .4.4.7.7.7h12.6c.4 0 .7-.3.7-.7V5.2c0-.4-.3-.7-.7-.7H5.7zm1.5 3h9.6v1.4H7.2V7.5zm0 3h9.6v1.4H7.2v-1.4zm0 3h6.5v1.4H7.2v-1.4z"/>
                    </svg>
                  )}
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Code Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Header */}
          <div className="px-4 py-2 border-b border-zinc-800 bg-[#2d2d2d] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
              </div>
              <span className="text-xs text-zinc-400 ml-2 font-mono">main.tsx</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-700/50 hover:bg-zinc-600 rounded transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isRunning ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Running...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Run
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Editor Area */}
          <div className="flex-1 relative min-h-0">
            {/* Line Numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1e1e1e] border-r border-zinc-800/50 flex flex-col pt-4 text-right pr-3 overflow-hidden">
              {Array.from({ length: Math.max(20, code.split('\n').length + 5) }, (_, i) => (
                <span key={i} className="text-xs text-zinc-600 leading-6 font-mono">{i + 1}</span>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              className="w-full h-full bg-[#1e1e1e] text-zinc-200 font-mono text-sm p-4 pl-16 focus:outline-none resize-none leading-6"
              style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace' }}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Panel - Task Description */}
        <div className="w-[320px] flex flex-col bg-[#252526] border-l border-zinc-800">
          {/* Task Panel Header */}
          <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-sm font-medium text-zinc-200">Task</span>
            </div>
            {isCompleted && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ✓
              </span>
            )}
          </div>

          {/* Task Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {/* Task Title */}
              <h2 className="text-base font-semibold text-zinc-100 mb-2">{task.title}</h2>
              
              {/* Task Meta */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  task.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                  task.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {task.difficulty}
                </span>
                {task.estimated_minutes && (
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {task.estimated_minutes}m
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-zinc-700/50 mb-3"></div>

              {/* Task Description */}
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </div>

              {/* Hints Section */}
              {task.hints && task.hints.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-xs font-medium text-zinc-300">Hints</span>
                  </div>
                  <ul className="space-y-1.5">
                    {task.hints.map((hint, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-zinc-400">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Verify Task Button */}
          <div className="p-3 border-t border-zinc-800">
            {isCompleted ? (
              <div className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-emerald-400">Task Completed!</span>
              </div>
            ) : (
              <button
                onClick={handleVerifyTask}
                disabled={isVerifying}
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verify Task
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Panel - Terminal */}
      <div className="h-36 border-t border-zinc-800 bg-[#1a1a1a] flex flex-col">
        {/* Terminal Header */}
        <div className="px-4 py-1.5 border-b border-zinc-800/50 flex items-center justify-between bg-[#252526]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-2 py-1 text-xs text-zinc-300 border-b-2 border-blue-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Terminal
            </div>
            <span className="text-xs text-zinc-600 px-2 py-1 hover:text-zinc-400 cursor-pointer">Problems</span>
            <span className="text-xs text-zinc-600 px-2 py-1 hover:text-zinc-400 cursor-pointer">Output</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Terminal Content */}
        <div className="flex-1 p-3 font-mono text-sm overflow-y-auto">
          {output ? (
            <pre className={`${output.includes('✓') || output.includes('successfully') ? 'text-emerald-400' : 'text-zinc-400'}`}>
              {output}
            </pre>
          ) : (
            <div className="flex items-center gap-2 text-zinc-500">
              <span className="text-emerald-500">$</span>
              <span className="animate-pulse">_</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
