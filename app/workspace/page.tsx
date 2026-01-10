import { Suspense } from 'react'
import WorkspaceClient from './WorkspaceClient'

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
          <div className="text-white">Loading workspace...</div>
        </div>
      }
    >
      <WorkspaceClient />
    </Suspense>
  )
}

