'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AssessmentCompletedPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Assessment Submitted!
          </h1>

          <p className="text-lg text-slate-600 mb-6">
            Thank you for completing the NeuroHolistic Assessment. Your responses have been
            securely stored and will help us create a personalized support plan tailored to your
            unique needs.
          </p>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-slate-900 mb-4">What happens next?</h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-bold mr-3 flex-shrink-0">
                  1
                </span>
                <span>Our team will review your assessment responses</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-bold mr-3 flex-shrink-0">
                  2
                </span>
                <span>You'll receive an initial consultation to discuss your goals</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-bold mr-3 flex-shrink-0">
                  3
                </span>
                <span>A personalized program will be created for your unique needs</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-bold mr-3 flex-shrink-0">
                  4
                </span>
                <span>You'll begin your transformation journey with our support</span>
              </li>
            </ul>
          </div>

          {/* Timeline */}
          <div className="bg-slate-50 rounded-lg p-6 mb-8">
            <p className="text-slate-700 mb-2">
              <span className="font-semibold">Expected timeline:</span> You should expect to hear
              from us within 2-3 business days with your assessment results and next steps.
            </p>
            <p className="text-sm text-slate-600">
              In the meantime, check your email for updates and feel free to reach out if you have
              any questions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-all"
            >
              Return to Dashboard
            </Link>
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-all"
            >
              Back to Home
            </Link>
          </div>

          {/* Support Message */}
          <p className="text-sm text-slate-500 mt-8">
            Questions? Contact our support team at{' '}
            <a href="mailto:support@neuroholistic.com" className="text-emerald-600 hover:underline">
              support@neuroholistic.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
