'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Integration {
  id: string;
  platform: string;
  accountId: string;
  accountName: string | null;
  isActive: boolean;
  createdAt: string;
}

function IntegrationsContent() {
  const { getToken } = useAuth();
  const searchParams = useSearchParams();
  // ... rest of state and effects ...
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();

    // Check for success message
    const success = searchParams.get('success');
    if (success) {
      setSuccessMessage(
        `Successfully connected ${success === 'google' ? 'Google Ads' : 'Meta Ads'}!`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [searchParams]);

  async function fetchIntegrations() {
    try {
      const token = await getToken();
      const workspaceId = localStorage.getItem('selectedWorkspaceId');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/oauth?workspaceId=${workspaceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(platform: 'google' | 'meta') {
    try {
      setConnectingPlatform(platform);
      const token = await getToken();
      const workspaceId = localStorage.getItem('selectedWorkspaceId');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/oauth/${platform}/initiate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'x-workspace-id': workspaceId || '',
          },
          body: JSON.stringify({ workspaceId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to initiate OAuth');
      }

      const data = await response.json();
      
      // Redirect to OAuth URL
      window.location.href = data.url;
    } catch (error) {
      console.error('Failed to connect:', error);
      alert('Failed to connect. Please try again.');
      setConnectingPlatform(null);
    }
  }

  function openDisconnectModal(integrationId: string) {
    setSelectedIntegrationId(integrationId);
    setShowDisconnectModal(true);
  }

  async function confirmDisconnect() {
    if (!selectedIntegrationId) return;

    try {
      setDisconnectingId(selectedIntegrationId);

      const token = await getToken();
      const workspaceId = localStorage.getItem('selectedWorkspaceId');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/oauth/${selectedIntegrationId}?workspaceId=${workspaceId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchIntegrations();
        setShowDisconnectModal(false);
        setSelectedIntegrationId(null);
      } else {
        alert('Failed to disconnect. Please try again.');
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
      alert('Failed to disconnect. Please try again.');
    } finally {
      setDisconnectingId(null);
    }
  }


  const googleIntegration = integrations.find((i) => i.platform === 'google' && i.isActive);
  const metaIntegration = integrations.find((i) => i.platform === 'meta' && i.isActive);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
        <p className="text-slate-600 mt-2">
          Connect your advertising accounts to start tracking performance
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Google Ads Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-3xl">
                  🔵
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Google Ads</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Connect your Google Ads account to track campaigns
                  </p>
                  {googleIntegration && (
                    <div className="mt-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-slate-700">
                        Connected: {googleIntegration.accountName || googleIntegration.accountId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                {googleIntegration ? (
                 <button
                    onClick={() => openDisconnectModal(googleIntegration.id)}
                    disabled={disconnectingId === googleIntegration.id}
                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {disconnectingId === googleIntegration.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      'Disconnect'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect('google')}
                    disabled={connectingPlatform === 'google'}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {connectingPlatform === 'google' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect Google Ads'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Meta Ads Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl">
                  🔴
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Meta Ads</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Connect Facebook & Instagram Ads
                  </p>
                  {metaIntegration && (
                    <div className="mt-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-slate-700">
                        Connected: {metaIntegration.accountName || metaIntegration.accountId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                {metaIntegration ? (
                  <button
                    onClick={() => openDisconnectModal(metaIntegration.id)}
                    disabled={disconnectingId === metaIntegration.id}
                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {disconnectingId === metaIntegration.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      'Disconnect'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect('meta')}
                    disabled={connectingPlatform === 'meta'}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
                  >
                    {connectingPlatform === 'meta' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect Meta Ads'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">
                  About Integrations
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your tokens are encrypted and stored securely</li>
                  <li>• We only request read access to your ad account data</li>
                  <li>• Data syncs automatically in the background</li>
                  <li>• You can disconnect at any time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Disconnect account?
            </h3>

            <p className="text-sm text-slate-600 mt-2">
              This will stop syncing data from this ad account.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDisconnectModal(false)}
                disabled={!!disconnectingId}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                No
              </button>

              <button
                onClick={confirmDisconnect}
                disabled={!!disconnectingId}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
              >
                {disconnectingId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  'Yes, Disconnect'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    }>
      <IntegrationsContent />
    </Suspense>
  );
}
