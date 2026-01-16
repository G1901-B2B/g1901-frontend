"use client";

import { useRef, useCallback } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  path?: string;
  readOnly?: boolean;
  onSave?: () => void;
}

// Map file extensions to Monaco language IDs
const extensionToLanguage: Record<string, string> = {
  // JavaScript/TypeScript
  ".js": "javascript",
  ".jsx": "javascript",
  ".ts": "typescript",
  ".tsx": "typescript",
  ".mjs": "javascript",
  ".cjs": "javascript",

  // Web
  ".html": "html",
  ".htm": "html",
  ".css": "css",
  ".scss": "scss",
  ".sass": "scss",
  ".less": "less",

  // Data
  ".json": "json",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".xml": "xml",
  ".toml": "ini",

  // Python
  ".py": "python",
  ".pyw": "python",
  ".pyi": "python",

  // Other languages
  ".go": "go",
  ".rs": "rust",
  ".rb": "ruby",
  ".php": "php",
  ".java": "java",
  ".kt": "kotlin",
  ".swift": "swift",
  ".c": "c",
  ".cpp": "cpp",
  ".cc": "cpp",
  ".h": "c",
  ".hpp": "cpp",

  // Shell
  ".sh": "shell",
  ".bash": "shell",
  ".zsh": "shell",
  ".fish": "shell",
  ".ps1": "powershell",

  // Config
  ".md": "markdown",
  ".mdx": "markdown",
  ".dockerfile": "dockerfile",
  ".env": "ini",
  ".gitignore": "ini",
  ".editorconfig": "ini",

  // SQL
  ".sql": "sql",

  // GraphQL
  ".graphql": "graphql",
  ".gql": "graphql",
};

function getLanguageFromPath(path: string): string {
  if (!path) return "plaintext";

  // Check for special filenames
  const filename = path.split("/").pop()?.toLowerCase() || "";
  if (filename === "dockerfile") return "dockerfile";
  if (filename === "makefile") return "makefile";
  if (filename.startsWith(".env")) return "ini";

  // Get extension
  const lastDot = path.lastIndexOf(".");
  if (lastDot === -1) return "plaintext";

  const ext = path.slice(lastDot).toLowerCase();
  return extensionToLanguage[ext] || "plaintext";
}

export default function MonacoEditor({
  value,
  onChange,
  language,
  path,
  readOnly = false,
  onSave,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Determine language from path if not provided
  const detectedLanguage = language || getLanguageFromPath(path || "");

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      // Add Ctrl+S / Cmd+S save handler
      editor.addAction({
        id: "save-file",
        label: "Save File",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
        run: () => {
          if (onSave) {
            onSave();
          }
        },
      });

      // Focus the editor
      editor.focus();
    },
    [onSave]
  );

  const handleChange: OnChange = useCallback(
    (value) => {
      onChange(value || "");
    },
    [onChange]
  );

  return (
    <Editor
      height="100%"
      language={detectedLanguage}
      value={value}
      onChange={handleChange}
      onMount={handleEditorDidMount}
      theme="vs-dark"
      path={path}
      options={{
        readOnly,
        minimap: { enabled: true },
        fontSize: 14,
        fontFamily:
          "'JetBrains Mono', 'Fira Code', Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace",
        fontLigatures: true,
        tabSize: 2,
        insertSpaces: true,
        wordWrap: "on",
        lineNumbers: "on",
        glyphMargin: false,
        folding: true,
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 3,
        renderLineHighlight: "line",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
        scrollbar: {
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
        },
        suggest: {
          showKeywords: true,
          showSnippets: true,
        },
        quickSuggestions: {
          other: true,
          comments: false,
          strings: true,
        },
      }}
      loading={
        <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin"></span>
            <span className="text-sm">Loading editor...</span>
          </div>
        </div>
      }
    />
  );
}
