import {
  getAuthHeadersClient,
  createProjectClient,
  listUserProjectsClient,
  deleteProject,
} from "../app/lib/api-client";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("api-client", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("getAuthHeadersClient", () => {
    it("returns proper headers with token", () => {
      const headers = getAuthHeadersClient("test-token");
      expect(headers).toEqual({
        Authorization: "Bearer test-token",
        "Content-Type": "application/json",
      });
    });

    it("throws when token is null", () => {
      expect(() => getAuthHeadersClient(null)).toThrow(
        "No authentication token available"
      );
    });
  });

  describe("createProjectClient", () => {
    it("creates a project successfully", async () => {
      const mockResponse = {
        success: true,
        project: {
          project_id: "123",
          project_name: "test-repo",
          github_url: "https://github.com/user/test-repo",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createProjectClient(
        {
          github_url: "https://github.com/user/test-repo",
          skill_level: "beginner",
          target_days: 7,
        },
        "test-token"
      );

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/projects/create"),
        expect.objectContaining({
          method: "POST",
          body: expect.any(String),
        })
      );
    });

    it("throws when token is null", async () => {
      await expect(
        createProjectClient(
          {
            github_url: "https://github.com/user/test-repo",
            skill_level: "beginner",
            target_days: 7,
          },
          null
        )
      ).rejects.toThrow("Authentication required");
    });

    it("throws on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: "Invalid GitHub URL" }),
      });

      await expect(
        createProjectClient(
          {
            github_url: "invalid",
            skill_level: "beginner",
            target_days: 7,
          },
          "test-token"
        )
      ).rejects.toThrow("Invalid GitHub URL");
    });
  });

  describe("listUserProjectsClient", () => {
    it("lists projects successfully", async () => {
      const mockResponse = {
        success: true,
        projects: [
          { project_id: "1", project_name: "repo1" },
          { project_id: "2", project_name: "repo2" },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await listUserProjectsClient("test-token");
      expect(result.success).toBe(true);
      expect(result.projects).toHaveLength(2);
    });

    it("throws when token is null", async () => {
      await expect(listUserProjectsClient(null)).rejects.toThrow(
        "Authentication required"
      );
    });

    it("throws on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(listUserProjectsClient("test-token")).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("deleteProject", () => {
    it("deletes a project successfully", async () => {
      const mockResponse = { success: true, deleted_embeddings: 5 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await deleteProject("project-123", "test-token");
      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/projects/project-123"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("throws when token is null", async () => {
      await expect(deleteProject("project-123", null)).rejects.toThrow(
        "Authentication required"
      );
    });

    it("throws on 404", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: "Project not found" }),
      });

      await expect(deleteProject("nonexistent", "test-token")).rejects.toThrow(
        "Project not found"
      );
    });
  });
});
