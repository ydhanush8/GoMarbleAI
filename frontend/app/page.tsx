import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            GoMarble Analytics
          </div>
          <div className="flex gap-4">
            <Link
              href="/sign-in"
              className="px-6 py-2 text-white hover:text-purple-200 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Unified Analytics for
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              Google & Meta Ads
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed">
            Stop switching between platforms. GoMarble brings all your advertising
            data together with AI-powered insights that help you make smarter decisions.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="Unified Dashboard"
            description="See all your campaign data from Google Ads and Meta Ads in one beautiful interface."
            icon="📊"
          />
          <FeatureCard
            title="AI Insights"
            description="Get intelligent recommendations powered by Claude AI to optimize your ad spend."
            icon="🤖"
          />
          <FeatureCard
            title="Real-time Sync"
            description="Automatic data synchronization keeps your metrics fresh and up-to-date."
            icon="⚡"
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-300 leading-relaxed">{description}</p>
    </div>
  );
}
