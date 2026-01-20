"use client";

import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lightbulb,
  FileCode,
  TestTube,
  Code2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TaskVerificationResponse } from "../../lib/api-verification";

interface VerificationResultsProps {
  result: TaskVerificationResponse;
}

export default function VerificationResults({
  result,
}: VerificationResultsProps) {
  const {
    passed,
    overall_feedback,
    requirements_check,
    hints,
    issues_found,
    suggestions,
    code_quality,
    test_status,
    pattern_match_status,
  } = result;

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card
        className={
          passed
            ? "border-emerald-500/20 bg-emerald-500/5"
            : "border-red-500/20 bg-red-500/5"
        }
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              {passed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500">Verification Passed</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-500">Verification Failed</span>
                </>
              )}
            </CardTitle>
            <Badge
              className={
                code_quality === "good"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : code_quality === "acceptable"
                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
              }
            >
              {code_quality}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {overall_feedback}
          </p>
        </CardContent>
      </Card>

      {/* Test Status & Pattern Match Status */}
      {(test_status || pattern_match_status) && (
        <div className="flex gap-2">
          {test_status && (
            <Badge
              className={
                test_status === "passed"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : test_status === "failed"
                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                    : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
              }
            >
              <TestTube className="w-3 h-3 mr-1" />
              Tests: {test_status}
            </Badge>
          )}
          {pattern_match_status && (
            <Badge
              className={
                pattern_match_status === "all_matched"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : pattern_match_status === "partial"
                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
              }
            >
              <Code2 className="w-3 h-3 mr-1" />
              Patterns: {pattern_match_status}
            </Badge>
          )}
        </div>
      )}

      {/* Requirements Check */}
      {Object.keys(requirements_check).length > 0 && (
        <Card className="border-zinc-800 bg-[#0c0c0e]">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Requirements Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[120px]">
              <div className="space-y-2">
                {Object.entries(requirements_check).map(([reqName, check]) => (
                  <div key={reqName} className="flex items-start gap-2 text-xs">
                    {check.met ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium ${
                          check.met ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {reqName}
                      </div>
                      {check.feedback && (
                        <div className="text-zinc-400 text-[10px] mt-0.5">
                          {check.feedback}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Hints (only if failed) */}
      {!passed && hints.length > 0 && (
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5" />
              Hints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {hints.map((hint, index) => (
                <li
                  key={index}
                  className="text-xs text-zinc-300 leading-relaxed flex items-start gap-2"
                >
                  <span className="text-blue-400 font-bold mt-0.5 shrink-0">
                    {index + 1}.
                  </span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Issues Found */}
      {issues_found.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" />
              Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {issues_found.map((issue, index) => (
                <li
                  key={index}
                  className="text-xs text-red-300 leading-relaxed flex items-start gap-2"
                >
                  <span className="text-red-400 font-bold mt-0.5 shrink-0">
                    •
                  </span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card className="border-zinc-800 bg-[#0c0c0e]">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="text-xs text-zinc-400 leading-relaxed flex items-start gap-2"
                >
                  <span className="text-zinc-500 font-bold mt-0.5 shrink-0">
                    •
                  </span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
