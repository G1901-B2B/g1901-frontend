'use client'

export default function ChatbotWidget() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-[#3f4449] rounded-lg shadow-2xl border border-white/10 w-80 h-96 flex flex-col">
        {/* Chat Header */}
        <div className="bg-[#2f3338] px-4 py-3 rounded-t-lg border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">AI Tutor</p>
              <p className="text-zinc-400 text-xs">Online</p>
            </div>
          </div>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-white/10 rounded-full flex-shrink-0"></div>
            <div className="bg-[#2f3338] rounded-lg px-3 py-2 max-w-[80%]">
              <p className="text-white text-sm">Hello! I'm your AI tutor. How can I help you with this project?</p>
            </div>
          </div>
          <div className="flex items-start gap-2 justify-end">
            <div className="bg-white/10 rounded-lg px-3 py-2 max-w-[80%]">
              <p className="text-white text-sm">This is a placeholder message</p>
            </div>
            <div className="w-6 h-6 bg-white/10 rounded-full flex-shrink-0"></div>
          </div>
        </div>
        
        {/* Chat Input */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-[#2f3338] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-white/20"
              disabled
            />
            <button 
              className="bg-white/10 hover:bg-white/20 text-white rounded-lg p-2 transition-colors disabled:opacity-50"
              disabled
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

