import Link from 'next/link';
import { Building2, ShieldCheck, UserCheck, BarChart3, ArrowRight, Wand2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      {/* Clean header */}
      <div className="absolute top-0 left-0 right-0 h-16 border-b border-gray-200 flex items-center px-8">
        <div className="flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-semibold text-gray-900">BitWizard</span>
        </div>
        <div className="ml-auto flex items-center gap-6 text-sm text-gray-600">
          <span>Insurance Fraud Detection</span>
          <span>v1.0</span>
        </div>
      </div>

      {/* Main content */}
      <div className="text-center max-w-4xl mb-16 mt-24">
        <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-4">
          BitWizard Fraud Detection
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          AI-powered claim integrity verification with XGBoost, Neo4j Graph Analytics, and Explainable AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Door A: Institutional */}
        <Link href="/portal/institutional" className="group">
          <div className="border border-gray-200 rounded-lg p-8 h-full bg-white hover:border-blue-400 hover:shadow-md transition-all">
            <div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="text-blue-600 w-6 h-6" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Institutional Route</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Connect via NHCX/FHIR Gateway with itemized billing and clinical data for B2B processing.
              </p>
            </div>
            <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-1 transition-all">
              Initialize Gateway <ArrowRight className="ml-1 w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Door B: Direct Consumer */}
        <Link href="/portal/consumer" className="group">
          <div className="border border-gray-200 rounded-lg p-8 h-full bg-white hover:border-blue-400 hover:shadow-md transition-all">
            <div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="text-blue-600 w-6 h-6" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Direct Consumer</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                SDK-based submission with MediaPipe liveness, Google Play Integrity, and DigiLocker verification.
              </p>
            </div>
            <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-1 transition-all">
              Launch Mobile SDK <ArrowRight className="ml-1 w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>

      {/* Adjuster Dashboard Quick Link */}
      <div className="mt-16 w-full max-w-4xl">
        <Link href="/dashboard" className="border border-gray-200 rounded-lg p-6 flex items-center justify-between bg-white hover:border-blue-400 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <BarChart3 className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Adjuster Dashboard</h3>
              <p className="text-sm text-gray-600">Review flagged cases and AI explainability reports.</p>
            </div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Open Dashboard
          </button>
        </Link>
      </div>

      <footer className="mt-20 text-gray-500 text-sm flex items-center gap-6">
        <span>© 2026 BitWizard</span>
        <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-blue-600" /> Secure FHIR Gateway v4.0.1</span>
      </footer>
    </div>
  );
}
