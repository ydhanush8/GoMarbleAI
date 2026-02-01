'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, Settings, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface Workspace {
  id: string;
  name: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { signOut } = useAuth();
  const router = useRouter();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  useEffect(() => {
    // In a real app, fetch workspace details from API
    const workspaceId = localStorage.getItem('selectedWorkspaceId');
    if (!workspaceId) {
      router.push('/workspace/select');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                  GoMarble
                </span>
              </Link>

              {/* Main Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="text-slate-700 hover:text-purple-600 font-medium transition-colors"
                >
                  Overview
                </Link>
                <Link
                  href="/dashboard/campaigns"
                  className="text-slate-700 hover:text-purple-600 font-medium transition-colors"
                >
                  Campaigns
                </Link>
                <Link
                  href="/dashboard/integrations"
                  className="text-slate-700 hover:text-purple-600 font-medium transition-colors"
                >
                  Integrations
                </Link>
                <Link
                  href="/dashboard/insights"
                  className="text-slate-700 hover:text-purple-600 font-medium transition-colors"
                >
                  AI Insights
                </Link>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Workspace Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <span className="font-medium text-slate-700">
                    {currentWorkspace?.name || 'Select Workspace'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {showWorkspaceMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    <Link
                      href="/workspace/select"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setShowWorkspaceMenu(false)}
                    >
                      Switch Workspace
                    </Link>
                    <Link
                      href="/workspace/create"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setShowWorkspaceMenu(false)}
                    >
                      Create New Workspace
                    </Link>
                  </div>
                )}
              </div>

              {/* Settings */}
              <Link
                href="/dashboard/settings"
                className="p-2 text-slate-600 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>

              {/* Sign Out */}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
