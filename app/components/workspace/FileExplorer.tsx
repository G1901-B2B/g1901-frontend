'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { listFiles, createFile, deleteFile, type FileItem } from '../../lib/api-workspace'

interface FileExplorerProps {
  workspaceId: string
  onFileSelect: (path: string) => void
  selectedFile?: string
  onRefresh?: () => void
}

interface FileTreeNodeProps {
  file: FileItem
  level: number
  onSelect: (path: string) => void
  onDelete: (path: string) => void
  onToggle: (path: string) => void
  onLoadChildren: (path: string) => void
  selectedFile?: string
  expandedFolders: Set<string>
  childrenMap: Map<string, FileItem[]>
}

// File/folder icons
function FileIcon({ filename, isDirectory }: { filename: string; isDirectory: boolean }) {
  if (isDirectory) {
    return (
      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      </svg>
    )
  }

  const ext = filename.split('.').pop()?.toLowerCase() || ''
  
  // TypeScript/JavaScript
  if (['ts', 'tsx'].includes(ext)) {
    return (
      <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h18v18H3V3zm16.525 13.707c-.131-.821-.666-1.511-2.252-2.155-.552-.259-1.165-.438-1.349-.854-.068-.248-.078-.382-.034-.529.113-.484.687-.629 1.137-.495.293.09.563.315.732.676.775-.507.775-.507 1.316-.844-.203-.314-.304-.451-.439-.586-.473-.528-1.103-.798-2.126-.775l-.528.067c-.507.124-.991.395-1.283.754-.855.968-.608 2.655.427 3.354 1.023.765 2.521.933 2.712 1.653.18.878-.652 1.159-1.475 1.058-.607-.136-.945-.439-1.316-1.002l-1.372.788c.157.359.337.517.607.832 1.305 1.316 4.568 1.249 5.153-.754.021-.067.18-.528.056-1.237l.034.003zm-6.737-5.434h-1.686c0 1.453-.007 2.898-.007 4.354 0 .924.047 1.772-.104 2.033-.247.517-.886.451-1.175.359-.297-.146-.448-.349-.623-.641-.047-.078-.082-.146-.095-.146l-1.368.844c.229.473.563.879.994 1.137.641.383 1.502.507 2.404.305.588-.17 1.095-.519 1.358-1.059.384-.697.302-1.553.299-2.509.008-1.541 0-3.083 0-4.635l.003-.042z"/>
      </svg>
    )
  }
  
  if (['js', 'jsx', 'mjs'].includes(ext)) {
    return (
      <svg className="w-4 h-4 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h18v18H3V3zm4.73 15.04c.4.85 1.19 1.55 2.54 1.55 1.5 0 2.53-.77 2.53-2.42v-5.22H11v5.19c0 .8-.32 1.02-.83 1.02-.53 0-.75-.35-.99-.77l-1.45.85zm5.55-.53c.52.99 1.48 1.58 3.04 1.58 1.61 0 2.67-.77 2.67-2.13 0-1.38-.99-1.91-2.32-2.47l-.48-.21c-.78-.35-1.12-.57-1.12-1.11 0-.45.35-.8.91-.8.52 0 .87.22 1.19.8l1.38-.89c-.59-.99-1.42-1.38-2.59-1.38-1.61 0-2.59.99-2.59 2.26 0 1.33.75 1.91 2.04 2.43l.48.21c.77.35 1.2.57 1.2 1.16 0 .5-.45.87-1.15.87-.83 0-1.26-.45-1.59-1l-1.5.85z"/>
      </svg>
    )
  }
  
  // Python
  if (['py', 'pyw'].includes(ext)) {
    return (
      <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.352 0 5.727 2.809 5.727 2.809l.007 2.911h6.391v.876H3.805S0 6.102 0 12.124s3.322 5.814 3.322 5.814h1.983v-2.799s-.107-3.322 3.267-3.322h5.628s3.162.052 3.162-3.054V3.892S17.893 0 12 0zM8.733 2.257a1.012 1.012 0 110 2.024 1.012 1.012 0 010-2.024z"/>
      </svg>
    )
  }
  
  // JSON
  if (ext === 'json') {
    return (
      <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 3h2v2H5v5a2 2 0 01-2 2 2 2 0 012 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 00-2-2H0v-2h1a2 2 0 002-2V5a2 2 0 012-2m14 0a2 2 0 012 2v4a2 2 0 002 2h1v2h-1a2 2 0 00-2 2v4a2 2 0 01-2 2h-2v-2h2v-5a2 2 0 012-2 2 2 0 01-2-2V5h-2V3h2z"/>
      </svg>
    )
  }
  
  // Markdown
  if (['md', 'mdx'].includes(ext)) {
    return (
      <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 4H2v16h20V4zM7 15H5v-6h2l2 2.5L11 9h2v6h-2v-4l-2 2-2-2v4zm10-2h2l-3 3-3-3h2V9h2v4z"/>
      </svg>
    )
  }
  
  // CSS
  if (['css', 'scss', 'sass', 'less'].includes(ext)) {
    return (
      <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.7 4.5C5.4 4.5 5 4.8 5 5.2v13.6c0 .4.4.7.7.7h12.6c.4 0 .7-.3.7-.7V5.2c0-.4-.3-.7-.7-.7H5.7zm1.5 3h9.6v1.4H7.2V7.5zm0 3h9.6v1.4H7.2v-1.4zm0 3h6.5v1.4H7.2v-1.4z"/>
      </svg>
    )
  }
  
  // HTML
  if (['html', 'htm'].includes(ext)) {
    return (
      <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.56L16.07 16.43L16.62 10.33H9.38L9.2 8.3H16.8L17 6.31H7L7.56 12.32H14.45L14.22 14.9L12 15.5L9.78 14.9L9.64 13.24H7.64L7.93 16.43L12 17.56M4.07 3H19.93L18.5 19.2L12 21L5.5 19.2L4.07 3Z"/>
      </svg>
    )
  }
  
  // Default file icon
  return (
    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
}

function FileTreeNode({
  file,
  level,
  onSelect,
  onDelete,
  onToggle,
  onLoadChildren,
  selectedFile,
  expandedFolders,
  childrenMap,
}: FileTreeNodeProps) {
  const isExpanded = expandedFolders.has(file.path)
  const isSelected = selectedFile === file.path
  const children = childrenMap.get(file.path) || []

  const handleClick = useCallback(() => {
    if (file.is_directory) {
      onToggle(file.path)
      // Load children if expanding and not yet loaded
      if (!isExpanded && !childrenMap.has(file.path)) {
        onLoadChildren(file.path)
      }
    } else {
      onSelect(file.path)
    }
  }, [file, isExpanded, onSelect, onToggle, onLoadChildren, childrenMap])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    // Simple delete for now - could expand to full context menu
    if (confirm(`Delete ${file.name}?`)) {
      onDelete(file.path)
    }
  }, [file, onDelete])

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 px-2 py-1 text-xs cursor-pointer rounded transition-colors ${
          isSelected
            ? 'bg-blue-600/30 text-zinc-100'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {file.is_directory && (
          <svg
            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        )}
        <FileIcon filename={file.name} isDirectory={file.is_directory} />
        <span className="truncate">{file.name}</span>
      </div>
      
      {file.is_directory && isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <FileTreeNode
              key={child.path}
              file={child}
              level={level + 1}
              onSelect={onSelect}
              onDelete={onDelete}
              onToggle={onToggle}
              onLoadChildren={onLoadChildren}
              selectedFile={selectedFile}
              expandedFolders={expandedFolders}
              childrenMap={childrenMap}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FileExplorer({
  workspaceId,
  onFileSelect,
  selectedFile,
  onRefresh,
}: FileExplorerProps) {
  const { getToken } = useAuth()
  const [rootFiles, setRootFiles] = useState<FileItem[]>([])
  const [childrenMap, setChildrenMap] = useState<Map<string, FileItem[]>>(new Map())
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [createType, setCreateType] = useState<'file' | 'folder'>('file')

  // Load root files
  const loadRootFiles = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = await getToken()
      if (!token) {
        setError('Not authenticated')
        return
      }
      const files = await listFiles(workspaceId, '/workspace', token)
      setRootFiles(files)
    } catch (err) {
      console.error('Failed to load files:', err)
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setIsLoading(false)
    }
  }, [workspaceId, getToken])

  useEffect(() => {
    loadRootFiles()
  }, [loadRootFiles])

  const handleFilesLoaded = useCallback((path: string, files: FileItem[]) => {
    setChildrenMap(prev => {
      const next = new Map(prev)
      next.set(path, files)
      return next
    })
  }, [])

  const handleLoadChildren = useCallback(async (path: string) => {
    try {
      const token = await getToken()
      if (!token) return
      const files = await listFiles(workspaceId, path, token)
      handleFilesLoaded(path, files)
    } catch (err) {
      console.error('Failed to load children:', err)
    }
  }, [workspaceId, getToken, handleFilesLoaded])

  const handleToggle = useCallback((path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  const handleDelete = useCallback(async (path: string) => {
    try {
      const token = await getToken()
      if (!token) return
      await deleteFile(workspaceId, path, token)
      // Refresh the file list
      loadRootFiles()
      setChildrenMap(new Map()) // Clear cache
      onRefresh?.()
    } catch (err) {
      console.error('Failed to delete:', err)
      alert('Failed to delete file')
    }
  }, [workspaceId, getToken, loadRootFiles, onRefresh])

  const handleCreate = useCallback(async () => {
    if (!newFileName.trim()) return
    
    try {
      const token = await getToken()
      if (!token) return
      
      const path = `/workspace/${newFileName.trim()}`
      await createFile(workspaceId, path, createType === 'folder', token)
      
      // Refresh and close
      loadRootFiles()
      setChildrenMap(new Map())
      setIsCreating(false)
      setNewFileName('')
      onRefresh?.()
    } catch (err) {
      console.error('Failed to create:', err)
      alert('Failed to create file')
    }
  }, [newFileName, createType, workspaceId, getToken, loadRootFiles, onRefresh])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin"></span>
          <span className="text-xs">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3">
        <div className="text-xs text-red-400 mb-2">{error}</div>
        <button
          onClick={loadRootFiles}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Explorer</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsCreating(true)
              setCreateType('file')
            }}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="New File"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button
            onClick={() => {
              setIsCreating(true)
              setCreateType('folder')
            }}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="New Folder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button
            onClick={loadRootFiles}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Create file/folder input */}
      {isCreating && (
        <div className="p-2 border-b border-zinc-800 bg-zinc-800/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-zinc-400">
              New {createType}:
            </span>
          </div>
          <div className="flex gap-1">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') setIsCreating(false)
              }}
              placeholder={createType === 'folder' ? 'folder-name' : 'filename.ext'}
              className="flex-1 px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={handleCreate}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Create
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-2 py-1 text-xs bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* File tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {rootFiles.length === 0 ? (
          <div className="px-3 py-4 text-xs text-zinc-500 text-center">
            No files in workspace
          </div>
        ) : (
          rootFiles.map((file) => (
            <FileTreeNode
              key={file.path}
              file={file}
              level={0}
              onSelect={onFileSelect}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onLoadChildren={handleLoadChildren}
              selectedFile={selectedFile}
              expandedFolders={expandedFolders}
              childrenMap={childrenMap}
            />
          ))
        )}
      </div>
    </div>
  )
}

