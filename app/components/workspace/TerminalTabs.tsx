"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import PreviewPortsPanel from "./PreviewPortsPanel";

// Dynamic import of Terminal to avoid SSR issues
const Terminal = dynamic(() => import("./Terminal"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#1a1a1a]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-5 h-5 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="text-xs text-zinc-500">Loading terminal...</span>
      </div>
    </div>
  ),
});

interface TerminalTab {
  id: string;
  name: string;
  sessionId?: string;
}

type PanelType = "terminal" | "preview" | "problems" | "output";

interface TerminalTabsProps {
  workspaceId: string;
  previewServerCount?: number;
  onPreviewClick?: () => void;
}

export default function TerminalTabs({
  workspaceId,
  previewServerCount = 0,
  onPreviewClick,
}: TerminalTabsProps) {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: "1", name: "Terminal" },
  ]);
  const [activeTabId, setActiveTabId] = useState("1");
  const [activePanel, setActivePanel] = useState<PanelType>("terminal");

  // Create a new terminal tab
  const handleCreateTab = useCallback(() => {
    const newId = String(Date.now());
    const newTab: TerminalTab = {
      id: newId,
      name: `Terminal ${tabs.length + 1}`,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  }, [tabs.length]);

  // Close a terminal tab
  const handleCloseTab = useCallback(
    (tabId: string, e: React.MouseEvent) => {
      e.stopPropagation();

      if (tabs.length === 1) {
        // Don't close the last tab
        return;
      }

      setTabs((prev) => prev.filter((t) => t.id !== tabId));

      // Switch to another tab if closing active
      if (activeTabId === tabId) {
        const remaining = tabs.filter((t) => t.id !== tabId);
        if (remaining.length > 0) {
          setActiveTabId(remaining[remaining.length - 1].id);
        }
      }
    },
    [tabs, activeTabId]
  );

  // Update tab session ID when connected
  const handleSessionCreated = useCallback(
    (tabId: string, sessionId: string) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === tabId ? { ...t, sessionId } : t))
      );
    },
    []
  );

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Tab bar */}
      <div className="flex items-center bg-[#252526] border-b border-zinc-800/50">
        {/* Tabs */}
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => {
                setActiveTabId(tab.id);
                setActivePanel("terminal");
              }}
              className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer border-r border-zinc-800 min-w-0 ${
                activeTabId === tab.id && activePanel === "terminal"
                  ? "bg-[#1a1a1a] text-zinc-300 border-b-2 border-b-blue-500"
                  : "bg-[#2d2d2d] text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs font-mono truncate">{tab.name}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="ml-1 text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* New terminal button */}
        <button
          onClick={handleCreateTab}
          className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
          title="New terminal"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Panel tabs */}
        <div className="flex items-center gap-4 px-2">
          <span
            onClick={() => {
              setActivePanel("preview");
              onPreviewClick?.();
            }}
            className={`text-xs px-2 py-1 cursor-pointer transition-colors relative ${
              activePanel === "preview"
                ? "text-emerald-400 font-semibold"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            Preview
            {previewServerCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-emerald-400 bg-emerald-400/20 rounded-full">
                {previewServerCount}
              </span>
            )}
          </span>
          <span
            onClick={() => setActivePanel("problems")}
            className={`text-xs px-2 py-1 cursor-pointer transition-colors ${
              activePanel === "problems"
                ? "text-blue-400 font-semibold"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            Problems
          </span>
          <span
            onClick={() => setActivePanel("output")}
            className={`text-xs px-2 py-1 cursor-pointer transition-colors ${
              activePanel === "output"
                ? "text-blue-400 font-semibold"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            Output
          </span>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 min-h-0">
        {activePanel === "preview" ? (
          <PreviewPortsPanel workspaceId={workspaceId} />
        ) : activePanel === "problems" ? (
          <div className="h-full flex items-center justify-center bg-[#1a1a1a]">
            <span className="text-xs text-zinc-600">No problems detected</span>
          </div>
        ) : activePanel === "output" ? (
          <div className="h-full flex items-center justify-center bg-[#1a1a1a]">
            <span className="text-xs text-zinc-600">No output</span>
          </div>
        ) : (
          (() => {
            const activeTab = tabs.find((tab) => tab.id === activeTabId);
            if (!activeTab) return null;
            return (
              <Terminal
                workspaceId={workspaceId}
                sessionId={activeTab.sessionId}
                onSessionCreated={(sessionId) =>
                  handleSessionCreated(activeTab.id, sessionId)
                }
                isActive
              />
            );
          })()
        )}
      </div>
    </div>
  );
}
