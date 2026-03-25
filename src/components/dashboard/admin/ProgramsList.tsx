'use client';

import { useState, useEffect } from 'react';
import type { Database } from '@/lib/supabase/database.types';

type Program = Database['public']['Tables']['programs']['Row'];

export default function ProgramsList() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activatingId, setActivatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/programs')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load programs');
        return res.json();
      })
      .then(setPrograms)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleActivate = async (id: string, userId: string | null) => {
    if (!confirm('Are you sure you want to forcibly activate this program?')) return;
    
    setActivatingId(id);
    try {
      // Assuming we can use the activate-dev logic or a new endpoint
      // Using activate-dev passing userId
      if (!userId) {
         alert("Cannot activate program without a user ID.");
         return;
      }

      // Actually, activate-dev is for creating a new program for a user.
      // If the program already exists but is not active (e.g. cancelled or completed), 
      // we might want a different API.
      // But based on the requirement "activate button for unpaid programs",
      // it sounds like we want to turn a non-active program into an active one.
      // However, if the program record doesn't exist for "unpaid", then we are CREATING it.
      // If we are listing `programs`, we are listing existing records.
      // If a program exists, it has a status.
      // If status is 'active', button disabled.
      // If status is 'cancelled' or maybe just not active, show button.
      
      // I'll assume we might need a dedicated endpoint to update status.
      // For now, I'll use a PATCH to /api/admin/programs/[id] if I create it.
      // Or I can use supabase client directly if RLS allows admin update?
      // But typically we use API.
      
      const res = await fetch(`/api/admin/programs/${id}/activate`, { // Need to create this
        method: 'POST' 
      });

      if (!res.ok) throw new Error('Failed to activate');
      
      setPrograms(programs.map(p => p.id === id ? { ...p, status: 'active' } : p));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActivatingId(null);
    }
  };

  if (loading) return <div>Loading programs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Programs Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client (User ID)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sessions
              </th>
               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {programs.map((program) => (
              <tr key={program.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {program.client_email || program.user_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {program.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {program.program_type} ({program.payment_id === 'manual_dev' ? 'Dev' : 'Stripe'})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {program.used_sessions} / {program.total_sessions}
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {program.status !== 'active' && (
                    <button
                      onClick={() => handleActivate(program.id, program.user_id)}
                      disabled={activatingId === program.id}
                      className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                    >
                      {activatingId === program.id ? 'Activating...' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
