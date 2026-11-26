import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import type { Project } from '../types/workflow';

const LOCAL_PROJECTS_KEY = 'cineforge_local_projects';

export const DEMO_PROJECTS: Project[] = [
  {
    _id: 'demo-1',
    id: 'demo-1',
    title: 'Neon Odyssey: Chronicles of Neo-Kyoto',
    status: 'completed',
    settings: { aspectRatio: '16:9', targetDurationSeconds: 60 },
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'demo-2',
    id: 'demo-2',
    title: 'The Silent City: First Contact',
    status: 'completed',
    settings: { aspectRatio: '16:9', targetDurationSeconds: 60 },
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export function getLocalProjects(): Project[] {
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEMO_PROJECTS;
}

function saveLocalProjects(list: Project[]) {
  try {
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(list));
  } catch {}
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<{ projects: Project[] }>('/projects');
      const list = Array.isArray(response.data.projects) ? response.data.projects : [];
      setProjects(list.length > 0 ? list : getLocalProjects());
    } catch (err) {
      console.warn('Backend unavailable, using local/demo projects:', err);
      setError(null);
      setProjects(getLocalProjects());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<{ projects: Project[] }>('/projects')
      .then((response) => {
        if (!cancelled) {
          const list = Array.isArray(response.data.projects) ? response.data.projects : [];
          setProjects(list.length > 0 ? list : getLocalProjects());
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn('Backend unavailable, using local/demo projects:', err);
          setError(null);
          setProjects(getLocalProjects());
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const createProject = async (title: string): Promise<Project> => {
    setIsCreating(true);
    setError(null);
    try {
      const response = await apiClient.post<{ project: Project }>('/projects', { title });
      const created = response.data.project;
      setProjects((prev) => {
        const next = [created, ...prev];
        saveLocalProjects(next);
        return next;
      });
      return created;
    } catch (err) {
      console.warn('Backend unavailable, creating local studio project:', err);
      const localId = `demo-${Date.now()}`;
      const localProject: Project = {
        _id: localId,
        id: localId,
        title: title.trim() || 'Untitled Film',
        status: 'draft',
        settings: { aspectRatio: '16:9', targetDurationSeconds: 60 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjects((prev) => {
        const base = prev.length > 0 ? prev : getLocalProjects();
        const next = [localProject, ...base];
        saveLocalProjects(next);
        return next;
      });
      return localProject;
    } finally {
      setIsCreating(false);
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    setError(null);
    try {
      await apiClient.delete(`/projects/${id}`);
    } catch (err) {
      console.warn('Backend unavailable, deleting local project:', err);
    }
    setProjects((prev) => {
      const next = prev.filter((p) => p._id !== id && p.id !== id);
      saveLocalProjects(next);
      return next;
    });
  };

  const updateProject = async (id: string, updates: Partial<Pick<Project, 'title' | 'status' | 'settings'>>): Promise<void> => {
    setError(null);
    try {
      const response = await apiClient.patch<{ project: Project }>(`/projects/${id}`, updates);
      const updatedProject = response.data.project;
      setProjects((prev) => {
        const next = prev.map((p) => (p._id === id || p.id === id ? { ...p, ...updatedProject } : p));
        saveLocalProjects(next);
        return next;
      });
    } catch (err) {
      console.warn('Backend unavailable, updating local project:', err);
      setProjects((prev) => {
        const next = prev.map((p) => (p._id === id || p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
        saveLocalProjects(next);
        return next;
      });
    }
  };

  return { projects, isLoading, isCreating, error, createProject, deleteProject, updateProject, refreshProjects: fetchProjects };
}
