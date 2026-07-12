import { Shield, FileCheck, Lock, Zap, Users, BarChart } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'AI Fraud Detection',
    description: 'Advanced AI algorithms detect fake IDs, modified documents, and deepfakes in real-time.',
  },
  {
    icon: FileCheck,
    title: 'Digital Signatures',
    description: 'PKI-based digital signatures with timestamp and blockchain verification.',
  },
  {
    icon: Lock,
    title: 'Bank-Grade Security',
    description: 'AES-256 encryption, zero-trust architecture, and immutable audit logs.',
  },
  {
    icon: Zap,
    title: 'Instant Verification',
    description: 'Verify documents in seconds with QR codes and blockchain hash validation.',
  },
  {
    icon: Users,
    title: 'Multi-Role Access',
    description: 'Dedicated dashboards for companies, notaries, banks, and administrators.',
  },
  {
    icon: BarChart,
    title: 'Analytics Dashboard',
    description: 'Real-time insights, compliance reports, and fraud monitoring.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-secondary-900 mb-4">
            Everything You Need for Digital Notarization
          </h2>
          <p className="text-xl text-secondary-600">
            Comprehensive platform with enterprise features for secure document management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-secondary-200 hover:border-primary-300 hover:shadow-lg transition-all group"
              >
                <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                  <Icon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-secondary-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
