"use client";

import { type Concept } from "../../lib/api-roadmap";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Lock } from "lucide-react";

interface ConceptCardProps {
  concept: Concept;
  onClick: () => void;
  completed?: boolean;
  disabled?: boolean;
}

export default function ConceptCard({
  concept,
  onClick,
  completed = false,
  disabled = false,
}: ConceptCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: concept.concept_id,
      disabled: completed || disabled,
      data: {
        concept,
        type: "concept",
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : disabled ? 0.6 : 1,
    cursor:
      completed || disabled ? (disabled ? "not-allowed" : "pointer") : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${disabled ? "grayscale-[0.5]" : ""}`}
    >
      <button
        onClick={disabled ? undefined : onClick}
        {...attributes}
        {...listeners}
        className={`
          w-full p-3 rounded-xl border transition-all duration-200 text-left relative overflow-hidden
          ${
            completed
              ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 shadow-sm"
              : disabled
                ? "bg-[#121214] border-zinc-800/50 cursor-not-allowed"
                : "bg-[#18181b] border-zinc-800 hover:border-zinc-700 hover:bg-[#1c1c1f] shadow-md"
          }
        `}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {!(completed || disabled) && (
              <GripVertical className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            )}
            {disabled && <Lock className="w-3 h-3 text-zinc-600" />}
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${completed ? "text-emerald-500/70" : "text-zinc-500"}`}
            >
              Step {concept.order_index}
            </span>
          </div>
          {completed && (
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>

        <h4
          className={`text-xs font-bold leading-tight mb-1.5 ${completed ? "text-zinc-300" : disabled ? "text-zinc-500" : "text-white"}`}
        >
          {concept.title}
        </h4>

        {concept.description && (
          <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">
            {concept.description}
          </p>
        )}

        {/* Status Line */}
        {!completed && !disabled && (
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-600/0 via-blue-600/20 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    </div>
  );
}
