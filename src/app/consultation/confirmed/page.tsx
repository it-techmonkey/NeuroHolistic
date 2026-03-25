import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function ConsultationConfirmedPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-light text-slate-900">Consultation Confirmed</h1>
        
        <p className="text-slate-600 leading-relaxed">
          Your booking has been successfully created. We have sent a confirmation email with the Google Meet link to your inbox.
        </p>
        
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 mt-8">
          <p className="text-sm text-slate-500 mb-4">Ready for your holistic journey?</p>
          <div className="space-y-3">
            <Link 
              href="/dashboard/client" 
              className="block w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
