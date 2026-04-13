import Link from 'next/link';
import { Building2, ShieldCheck, UserCheck, BarChart3, ArrowRight, Wand2, TrendingUp } from 'lucide-react';

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

      {/* Insurance Type Selection */}
      <div className="mt-16 w-full max-w-6xl">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Select Insurance Type</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Health Insurance */}
          <Link href="/insurance/health" className="group">
            <div className="border border-gray-200 rounded-xl p-8 h-full bg-white hover:border-blue-400 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <ShieldCheck className="text-blue-600 w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Health Insurance</h3>
                  <p className="text-gray-600">Medical claims, hospital billing, prescription fraud detection</p>
                </div>
              </div>
              <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                Get Started <ArrowRight className="ml-1 w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Car/Auto Insurance */}
          <Link href="/insurance/auto" className="group">
            <div className="border border-gray-200 rounded-xl p-8 h-full bg-white hover:border-blue-400 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                  <Building2 className="text-green-600 w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Car/Auto Insurance</h3>
                  <p className="text-gray-600">Vehicle damage, accident claims, repair fraud detection</p>
                </div>
              </div>
              <div className="flex items-center text-green-600 font-medium group-hover:gap-2 transition-all">
                Get Started <ArrowRight className="ml-1 w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Term/Life Insurance */}
          <Link href="/insurance/life" className="group">
            <div className="border border-gray-200 rounded-xl p-8 h-full bg-white hover:border-blue-400 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                  <UserCheck className="text-purple-600 w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Term/Life Insurance</h3>
                  <p className="text-gray-600">Life insurance claims, policy fraud detection</p>
                </div>
              </div>
              <div className="flex items-center text-purple-600 font-medium group-hover:gap-2 transition-all">
                Get Started <ArrowRight className="ml-1 w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Corporate/Property Insurance */}
          <Link href="/insurance/corporate" className="group">
            <div className="border border-gray-200 rounded-xl p-8 h-full bg-white hover:border-blue-400 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
                  <Building2 className="text-orange-600 w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Corporate/Property Insurance</h3>
                  <p className="text-gray-600">Business property, commercial claims, corporate fraud</p>
                </div>
              </div>
              <div className="flex items-center text-orange-600 font-medium group-hover:gap-2 transition-all">
                Get Started <ArrowRight className="ml-1 w-5 h-5" />
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex justify-center gap-6">
            <Link 
              href="/login" 
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/submit" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Submit Claim
            </Link>
          </div>
        </div>
      </div>

      <footer className="mt-20 text-gray-500 text-sm flex items-center gap-6">
        <span>© 2026 BitWizard</span>
        <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-blue-600" /> Secure FHIR Gateway v4.0.1</span>
      </footer>
    </div>
  );
}
