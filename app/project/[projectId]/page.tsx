import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Header from '../../components/Header'
import RoadmapPage from '../../components/roadmap/RoadmapPage'
import { getProject, type Project } from '../../lib/api'

interface ProjectPageProps {
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  // Await params in Next.js 16
  const { projectId } = await params

  if (!projectId) {
    redirect('/dashboard')
  }

  let project: Project | null = null
  let error: string | null = null

  try {
    const response = await getProject(projectId)
    if (response.success) {
      project = response.project
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load project'
  }

  if (error || !project) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#2f3338]">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-semibold text-white mb-4">
                Project Not Found
              </h1>
              <p className="text-zinc-400 mb-6">{error || 'Project could not be loaded'}</p>
              <a 
                href="/dashboard"
                className="inline-block px-5 py-2.5 text-[14px] font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#2f3338]">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="mb-3">
            <h1 className="text-lg font-semibold text-white mb-1">
              {project.project_name}
            </h1>
            <p className="text-xs text-zinc-400">
              Status: <span className="capitalize text-white">{project.status}</span>
              {' • '}
              Skill Level: <span className="capitalize text-white">{project.skill_level}</span>
              {' • '}
              Duration: <span className="text-white">{project.target_days} days</span>
            </p>
          </div>
          
          {project.status === 'ready' ? (
            <RoadmapPage projectId={projectId} />
          ) : (
            <div className="bg-[#3f4449] rounded-lg p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-white mb-2">Preparing Your Learning Roadmap</h2>
                <p className="text-zinc-400 mb-6">
                  {project.status === 'processing' 
                    ? 'Analyzing your repository and generating embeddings...'
                    : 'Setting up your project...'
                  }
                </p>
                <p className="text-sm text-zinc-500">
                  This may take a few minutes. The roadmap will appear here once ready.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

