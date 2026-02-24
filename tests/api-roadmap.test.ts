import {
  getRoadmap,
  getDayDetails,
  getConceptDetails,
  getProgress,
  startTask,
  completeTask,
  getGenerationStatus,
} from "../app/lib/api-roadmap";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("api-roadmap", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("getRoadmap", () => {
    it("fetches roadmap successfully", async () => {
      const mockDays = [
        {
          day_id: "d1",
          day_number: 0,
          theme: "Getting Started",
          generated_status: "generated",
        },
        {
          day_id: "d2",
          day_number: 1,
          theme: "Core Concepts",
          generated_status: "generated",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, days: mockDays }),
      });

      const result = await getRoadmap("project-123", "test-token");
      expect(result.success).toBe(true);
      expect(result.days).toHaveLength(2);
      expect(result.days[0].theme).toBe("Getting Started");
    });

    it("throws without token", async () => {
      await expect(getRoadmap("project-123", null)).rejects.toThrow(
        "Authentication required"
      );
    });

    it("throws on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Not Found",
      });

      await expect(getRoadmap("project-123", "token")).rejects.toThrow(
        "Failed to fetch roadmap"
      );
    });
  });

  describe("getDayDetails", () => {
    it("fetches day details successfully", async () => {
      const mockDay = {
        day_id: "d1",
        day_number: 0,
        theme: "Getting Started",
      };
      const mockConcepts = [
        { concept_id: "c1", title: "Introduction", order_index: 0 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          day: mockDay,
          concepts: mockConcepts,
        }),
      });

      const result = await getDayDetails("project-123", "d1", "test-token");
      expect(result.success).toBe(true);
      expect(result.day.theme).toBe("Getting Started");
      expect(result.concepts).toHaveLength(1);
    });

    it("throws without token", async () => {
      await expect(getDayDetails("p1", "d1", null)).rejects.toThrow(
        "Authentication required"
      );
    });
  });

  describe("getConceptDetails", () => {
    it("fetches concept details with tasks", async () => {
      const mockConcept = {
        concept_id: "c1",
        title: "Intro",
        content: "# Introduction\nWelcome",
      };
      const mockTasks = [
        {
          task_id: "t1",
          title: "Read the README",
          task_type: "reading",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          concept: mockConcept,
          tasks: mockTasks,
        }),
      });

      const result = await getConceptDetails("p1", "c1", "token");
      expect(result.concept.title).toBe("Intro");
      expect(result.tasks).toHaveLength(1);
    });

    it("throws on error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "Server Error",
      });

      await expect(getConceptDetails("p1", "c1", "token")).rejects.toThrow(
        "Failed to fetch concept details"
      );
    });
  });

  describe("getProgress", () => {
    it("fetches user progress", async () => {
      const mockProgress = {
        day_progress: { d1: { progress_status: "done" } },
        concept_progress: {},
        task_progress: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, ...mockProgress }),
      });

      const result = await getProgress("project-123", "token");
      expect(result.success).toBe(true);
      expect(result.day_progress).toBeDefined();
    });
  });

  describe("getGenerationStatus", () => {
    it("fetches generation status", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          total_days: 7,
          generated_days: 3,
          generation_progress: 42.8,
          is_complete: false,
          is_generating: true,
          status_counts: {
            pending: 4,
            generating: 0,
            generated: 3,
            failed: 0,
          },
        }),
      });

      const result = await getGenerationStatus("project-123", "token");
      expect(result.total_days).toBe(7);
      expect(result.generated_days).toBe(3);
      expect(result.is_complete).toBe(false);
    });
  });

  describe("startTask", () => {
    it("starts a task successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await startTask("project-123", "task-1", "token");
      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/progress/project-123/task/task-1/start"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("throws without token", async () => {
      await expect(startTask("p1", "t1", null)).rejects.toThrow(
        "Authentication required"
      );
    });
  });

  describe("completeTask", () => {
    it("completes a task successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await completeTask("project-123", "task-1", "token");
      expect(result.success).toBe(true);
    });

    it("completes a task with extra data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await completeTask("project-123", "task-1", "token", {
        github_username: "user",
        user_repo_url: "https://github.com/user/repo",
      });

      expect(result.success).toBe(true);
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.github_username).toBe("user");
    });

    it("throws on failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Bad Request",
      });

      await expect(completeTask("p1", "t1", "token")).rejects.toThrow(
        "Failed to complete task"
      );
    });
  });
});
