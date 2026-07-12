import { Upload, Scan, Shield, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Documents',
    description: 'Drag and drop your documents. Support for PDF, DOCX, and images with automatic OCR.',
    step: 1,
  },
  {
    icon: Scan,
    title: 'AI Validation',
    description: 'Automatic fraud detection, face verification, and document authenticity checks.',
    step: 2,
  },
  {
    icon: Shield,
    title: 'Notary Review',
    description: 'Licensed notary verifies identity, applies digital seal, and issues certificate.',
    step: 3,
  },
  {
    icon: CheckCircle,
    title: 'Bank Verification',
    description: 'Instant verification with QR code and blockchain hash. Approve loans in minutes.',
    step: 4,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary-50">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-secondary-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-secondary-600">
            Simple 4-step process from upload to verification
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative">
                <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-elevated transition-shadow">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="bg-primary-50 w-16 h-16 rounded-lg flex items-center justify-center mb-4 mt-4">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-secondary-600">
                    {step.description}
                  </p>
                </div>

                {/* Connector Arrow (hidden on last item) */}
                {step.step < steps.length && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-primary-300"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-primary-300 border-y-4 border-y-transparent"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
