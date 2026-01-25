"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink, Loader2 } from "lucide-react";
import {
  getPreviewServers,
  type PreviewServerInfo,
} from "../../lib/api-workspace";

interface PreviewPortsPanelProps {
  workspaceId: string | null;
}

export default function PreviewPortsPanel({
  workspaceId,
}: PreviewPortsPanelProps) {
  const { getToken } = useAuth();
  const [previewServers, setPreviewServers] = useState<PreviewServerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshPreviewServers = useCallback(async () => {
    if (!workspaceId) {
      setPreviewServers([]);
      return;
    }
    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) return;
      const result = await getPreviewServers(workspaceId, token);
      if (result?.servers) {
        // Filter only active servers with URLs
        const activeServers = result.servers.filter(
          (server) => server.url && server.is_active !== false
        );
        setPreviewServers(activeServers);
      } else {
        setPreviewServers([]);
      }
    } catch (err) {
      console.warn("Failed to fetch preview servers:", err);
      setPreviewServers([]);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, getToken]);

  // Poll for preview servers every 5 seconds
  useEffect(() => {
    if (!workspaceId) {
      setPreviewServers([]);
      return;
    }

    // Initial fetch
    refreshPreviewServers();

    // Set up polling interval
    const intervalId = setInterval(() => {
      refreshPreviewServers();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [workspaceId, refreshPreviewServers]);

  const activePreviewServers = previewServers.filter(
    (server) => server.url && server.is_active !== false
  );

  return (
    <div className="h-full flex flex-col bg-[#0c0c0e] border-t border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-8 border-b border-zinc-800 bg-[#09090b]">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Preview Ports
          </span>
          {isLoading && (
            <Loader2 className="w-3 h-3 text-zinc-500 animate-spin" />
          )}
        </div>
        {activePreviewServers.length > 0 && (
          <span className="text-[10px] text-zinc-500">
            {activePreviewServers.length} server
            {activePreviewServers.length !== 1 ? "s" : ""} running
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activePreviewServers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Globe className="w-8 h-8 text-zinc-700 mb-2" />
            <p className="text-sm text-zinc-500 mb-1">No previews detected</p>
            <p className="text-xs text-zinc-600">
              Start a server in the terminal to see a preview link
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activePreviewServers.map((server, index) => (
              <div
                key={`${server.container_port}-${server.url}`}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
              >
                <Button
                  onClick={() =>
                    server.url && window.open(server.url, "_blank")
                  }
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white justify-between h-auto py-3 rounded-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{`Preview ${index + 1}`}</span>
                    {server.server_type && (
                      <span className="text-[10px] text-emerald-100 bg-emerald-700/30 px-1.5 py-0.5 rounded">
                        {server.server_type}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-100">
                      Port {server.container_port}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </Button>
                {server.url && (
                  <div className="px-3 py-2 bg-zinc-950 border-t border-zinc-800">
                    <a
                      href={server.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-400 hover:text-zinc-300 break-all font-mono"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {server.url}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
