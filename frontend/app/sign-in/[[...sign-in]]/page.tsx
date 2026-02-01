import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            GoMarble Analytics
          </h1>
          <p className="text-slate-300">
            Your intelligent ads analytics platform
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-white shadow-2xl',
            },
          }}
          signUpUrl="/sign-up"
          redirectUrl="/workspace/select"
        />
      </div>
    </div>
  );
}
