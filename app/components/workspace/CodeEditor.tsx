'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { type Task, completeTask } from '../../lib/api-roadmap'
import { getOrCreateWorkspace, readFile, writeFile, type WorkspaceInfo } from '../../lib/api-workspace'
import MonacoEditor from './MonacoEditor'
import FileExplorer from './FileExplorer'

interface CodeEditorProps {
  task: Task
  projectId: string
  onComplete: () => void
}

interface OpenFile {
  path: string
  content: string
  isDirty: boolean
  originalContent: string
}

export default function CodeEditor({ task, projectId, onComplete, initialCompleted }: CodeEditorProps & { initialCompleted?: boolean }) {
  const { getToken } = useAuth()
  
  // Workspace state
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null)
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true)
  const [workspaceError, setWorkspaceError] = useState<string | null>(null)
  
  // File state
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([])
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null)
  const [isLoadingFile, setIsLoadingFile] = useState(false)
  
  // Editor state
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCompleted, setIsCompleted] = useState(initialCompleted || false)
  const [isVerifying, setIsVerifying] = useState(false)

  // Get active file
  const activeFile = openFiles.find(f => f.path === activeFilePath)

  // Initialize workspace
  useEffect(() => {
    let mounted = true
    
    async function initWorkspace() {
      try {
        setIsLoadingWorkspace(true)
        setWorkspaceError(null)
        
        const token = await getToken()
        if (!token || !mounted) return
        
        const ws = await getOrCreateWorkspace(projectId, token)
        if (mounted) {
          setWorkspace(ws)
        }
      } catch (err) {
        console.error('Failed to init workspace:', err)
        if (mounted) {
          setWorkspaceError(err instanceof Error ? err.message : 'Failed to initialize workspace')
        }
      } finally {
        if (mounted) {
          setIsLoadingWorkspace(false)
        }
      }
    }
    
    initWorkspace()
    return () => { mounted = false }
  }, [projectId, getToken])

  // Handle initial completed state
  useEffect(() => {
    if (initialCompleted) {
      setIsCompleted(true)
      onComplete()
    }
  }, [initialCompleted, onComplete])

  // Open a file
  const handleFileSelect = useCallback(async (path: string) => {
    if (!workspace) return
    
    // Check if already open
    const existing = openFiles.find(f => f.path === path)
    if (existing) {
      setActiveFilePath(path)
      return
    }
    
    // Load file content
    try {
      setIsLoadingFile(true)
      const token = await getToken()
      if (!token) return
      
      const content = await readFile(workspace.workspace_id, path, token)
      
      setOpenFiles(prev => [...prev, {
        path,
        content,
        originalContent: content,
        isDirty: false,
      }])
      setActiveFilePath(path)
    } catch (err) {
      console.error('Failed to open file:', err)
      setOutput(`Failed to open file: ${path}`)
    } finally {
      setIsLoadingFile(false)
    }
  }, [workspace, openFiles, getToken])

  // Update file content
  const handleContentChange = useCallback((newContent: string) => {
    if (!activeFilePath) return
    
    setOpenFiles(prev => prev.map(f => {
      if (f.path === activeFilePath) {
        return {
          ...f,
          content: newContent,
          isDirty: newContent !== f.originalContent,
        }
      }
      return f
    }))
  }, [activeFilePath])

  // Save current file
  const handleSave = useCallback(async () => {
    if (!workspace || !activeFile || !activeFile.isDirty) return
    
    try {
      setIsSaving(true)
      const token = await getToken()
      if (!token) return
      
      await writeFile(workspace.workspace_id, activeFile.path, activeFile.content, token)
      
      setOpenFiles(prev => prev.map(f => {
        if (f.path === activeFile.path) {
          return {
            ...f,
            originalContent: activeFile.content,
            isDirty: false,
          }
        }
        return f
      }))
      
      setOutput('✓ File saved successfully')
    } catch (err) {
      console.error('Failed to save file:', err)
      setOutput(`Failed to save file: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }, [workspace, activeFile, getToken])

  // Close a file tab
  const handleCloseTab = useCallback((path: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const fileToClose = openFiles.find(f => f.path === path)
    if (fileToClose?.isDirty) {
      if (!confirm('You have unsaved changes. Close anyway?')) {
        return
      }
    }
    
    setOpenFiles(prev => prev.filter(f => f.path !== path))
    
    // Switch to another tab if closing active
    if (activeFilePath === path) {
      const remaining = openFiles.filter(f => f.path !== path)
      setActiveFilePath(remaining.length > 0 ? remaining[remaining.length - 1].path : null)
    }
  }, [openFiles, activeFilePath])

  // Verify task
  const handleVerifyTask = async () => {
    // Check if there's any written code
    const hasCode = openFiles.some(f => f.content.trim().length > 10)
    if (!hasCode) {
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

  // Run code (placeholder for now)
  const handleRun = async () => {
    setIsRunning(true)
    setTimeout(() => {
      setOutput('Code executed successfully!')
      setIsRunning(false)
    }, 1000)
  }

  // Get filename from path
  const getFilename = (path: string) => path.split('/').pop() || path

  // Loading state
  if (isLoadingWorkspace) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-zinc-600 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm text-zinc-400">Initializing workspace...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (workspaceError) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <span className="text-sm text-zinc-400">{workspaceError}</span>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel - File Explorer */}
        <div className="w-56 bg-[#252526] border-r border-zinc-800 flex flex-col">
          {workspace ? (
            <FileExplorer
              workspaceId={workspace.workspace_id}
              onFileSelect={handleFileSelect}
              selectedFile={activeFilePath || undefined}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
              No workspace
            </div>
          )}
        </div>

        {/* Center Panel - Code Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* File Tabs */}
          <div className="flex items-center bg-[#252526] border-b border-zinc-800 overflow-x-auto">
            {openFiles.map((file) => (
              <div
                key={file.path}
                onClick={() => setActiveFilePath(file.path)}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-zinc-800 min-w-0 ${
                  activeFilePath === file.path
                    ? 'bg-[#1e1e1e] text-zinc-200'
                    : 'bg-[#2d2d2d] text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span className="text-xs font-mono truncate">{getFilename(file.path)}</span>
                {file.isDirty && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                <button
                  onClick={(e) => handleCloseTab(file.path, e)}
                  className="ml-1 text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            
            {openFiles.length === 0 && (
              <div className="px-4 py-2 text-xs text-zinc-600">
                Select a file to edit
              </div>
            )}
          </div>

          {/* Editor Header */}
          {activeFile && (
            <div className="px-4 py-2 border-b border-zinc-800 bg-[#2d2d2d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono">{activeFile.path}</span>
                {isLoadingFile && (
                  <span className="w-3 h-3 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin"></span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !activeFile.isDirty}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-700/50 hover:bg-zinc-600 rounded transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
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
          )}

          {/* Code Editor Area */}
          <div className="flex-1 relative min-h-0">
            {activeFile ? (
              <MonacoEditor
                value={activeFile.content}
                onChange={handleContentChange}
                path={activeFile.path}
                onSave={handleSave}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <p className="text-sm">Select a file from the explorer to start editing</p>
              </div>
            )}
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
