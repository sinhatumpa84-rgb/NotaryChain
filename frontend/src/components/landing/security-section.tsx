import { Lock, Eye, FileCheck, Database } from 'lucide-react';

export function SecuritySection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-secondary-900">
              Enterprise-Grade Security
            </h2>
            <p className="text-xl text-secondary-600">
              Built with security at the core. Bank-level encryption, compliance certifications, and immutable audit trails.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 p-3 rounded-lg flex-shrink-0">
                  <Lock className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-1">
                    AES-256 Encryption
                  </h3>
                  <p className="text-secondary-600">
                    All documents encrypted at rest and in transit with TLS 1.3
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 p-3 rounded-lg flex-shrink-0">
                  <Eye className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-1">
                    Zero Trust Architecture
                  </h3>
                  <p className="text-secondary-600">
                    Device fingerprinting, IP tracking, and geo-location verification
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 p-3 rounded-lg flex-shrink-0">
                  <FileCheck className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-1">
                    Immutable Audit Logs
                  </h3>
                  <p className="text-secondary-600">
                    Every action logged with blockchain-backed tamper-proof records
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 p-3 rounded-lg flex-shrink-0">
                  <Database className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-1">
                    Compliance Certified
                  </h3>
                  <p className="text-secondary-600">
                    GDPR, SOC2 Type II, ISO 27001, and eIDAS compliant
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Security Badges */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-secondary-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">99.9%</div>
              <div className="text-sm text-secondary-600">Uptime SLA</div>
            </div>
            <div className="bg-secondary-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">256-bit</div>
              <div className="text-sm text-secondary-600">Encryption</div>
            </div>
            <div className="bg-secondary-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">SOC 2</div>
              <div className="text-sm text-secondary-600">Type II</div>
            </div>
            <div className="bg-secondary-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">ISO</div>
              <div className="text-sm text-secondary-600">27001</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
