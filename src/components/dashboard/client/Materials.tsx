'use client';
import { FileText, Video, Download } from 'lucide-react';

export default function Materials({ materials }: { materials: any[] }) {
  if (!materials || materials.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-slate-900 font-medium">No materials yet</h3>
        <p className="text-slate-500 text-sm mt-1">Your therapist will upload resources here after sessions.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map((file) => (
        <div key={file.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-2 rounded-lg ${file.type === 'video' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
              {file.type === 'video' ? <Video className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <span className="text-xs text-slate-400">{new Date(file.created_at).toLocaleDateString()}</span>
          </div>
          <h3 className="text-slate-900 font-medium truncate mb-1">{file.filename || 'Untitled Resource'}</h3>
          <p className="text-xs text-slate-500 mb-4 line-clamp-2">{file.description || 'Session material'}</p>
          
          <a 
            href={file.url} 
            download
            className="mt-auto w-full inline-flex justify-center items-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </a>
        </div>
      ))}
    </div>
  );
}
