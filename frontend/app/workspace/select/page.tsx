'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, Building2, ArrowRight, Loader2 } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  role: string;
  integrations: Array<{
    platform: string;
    accountName: string | null;
    isActive: boolean;
  }>;
  createdAt: string;
}

export default function WorkspaceSelectPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const token = await getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workspaces`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch workspaces');
        }

        const data = await response.json();
        setWorkspaces(data.workspaces || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchWorkspaces();
  }, [getToken]);

  const handleSelectWorkspace = (workspaceId: string) => {
    // Store selected workspace in localStorage
    localStorage.setItem('selectedWorkspaceId', workspaceId);
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Select Workspace
          </h1>
          <p className="text-slate-300">
            Choose a workspace to continue, or create a new one
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => handleSelectWorkspace(workspace.id)}
              className="group p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/15 transition-all text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Building2 className="w-6 h-6 text-purple-400" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">
                {workspace.name}
              </h3>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                  {workspace.role}
                </span>
                {workspace.integrations.length > 0 && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                    {workspace.integrations.length} integration
                    {workspace.integrations.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {workspace.integrations.length > 0 && (
                <div className="flex gap-2">
                  {workspace.integrations.map((integration, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-400"
                      title={integration.accountName || integration.platform}
                    >
                      {integration.platform === 'google' ? '🔵' : '🔴'}{' '}
                      {integration.platform}
                    </div>
                  ))}
                </div>
              )}
            </button>
          ))}

          {/* Create New Workspace Card */}
          <button
            onClick={() => router.push('/workspace/create')}
            className="group p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-2 border-dashed border-purple-400/50 rounded-xl hover:border-purple-400 transition-all"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="p-4 bg-purple-500/20 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Create New Workspace
              </h3>
              <p className="text-slate-300 text-sm text-center">
                Set up a new workspace for your ad campaigns
              </p>
            </div>
          </button>
        </div>

        {workspaces.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">
              You don't have any workspaces yet.
            </p>
            <button
              onClick={() => router.push('/workspace/create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
