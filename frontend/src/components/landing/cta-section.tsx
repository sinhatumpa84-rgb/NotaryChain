import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-800">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white">
            Ready to Go Paperless?
          </h2>
          <p className="text-xl text-primary-100">
            Join 500+ companies already using Digital Notary Platform to streamline their document workflows
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center space-x-2 bg-primary-700 text-white border-2 border-white px-8 py-4 rounded-lg hover:bg-primary-600 transition-all font-semibold"
            >
              <span>Talk to Sales</span>
            </Link>
          </div>

          <p className="text-sm text-primary-200">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
