/**
 * API client for task verification endpoints.
 */

import { apiClient } from "./api-client";

export interface RequirementCheck {
  met: boolean;
  feedback: string;
}

export interface TaskVerificationResponse {
  success: boolean;
  task_id: string;
  passed: boolean;
  overall_feedback: string;
  requirements_check: Record<string, RequirementCheck>;
  hints: string[];
  issues_found: string[];
  suggestions: string[];
  code_quality: string;
  test_status?: string | null;
  pattern_match_status?: string | null;
}

export interface VerifyTaskRequest {
  workspace_id: string;
}

/**
 * Verify a task using the deep verification system.
 */
export async function verifyTask(
  taskId: string,
  workspaceId: string,
  token: string | null
): Promise<TaskVerificationResponse> {
  if (!token) {
    throw new Error("Authentication token required");
  }

  const response = await apiClient.post<TaskVerificationResponse>(
    `/api/tasks/${taskId}/verify`,
    {
      workspace_id: workspaceId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
