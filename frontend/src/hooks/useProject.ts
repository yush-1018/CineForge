import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import type { Project } from '../types/workflow';
import { getLocalProjects } from './useProjects';

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchProject = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      // Immediately check local/demo cache for demo- IDs or offline resilience
      const localMatch = getLocalProjects().find((p) => p._id === id || p.id === id);

      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get<{ project: Project }>(`/projects/${id}`);
        if (active) {
          setProject(response.data.project);
        }
      } catch (err) {
        console.warn('Backend unavailable, loading local/demo project:', err);
        if (active) {
          if (localMatch) {
            setProject(localMatch);
            setError(null);
          } else {
            setProject({
              _id: id,
              id,
              title: 'CineForge Studio Project',
              status: 'draft',
              settings: { aspectRatio: '16:9', targetDurationSeconds: 60 },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            setError(null);
          }
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchProject();
    return () => {
      active = false;
    };
  }, [id]);

  return { project, isLoading, error };
}
