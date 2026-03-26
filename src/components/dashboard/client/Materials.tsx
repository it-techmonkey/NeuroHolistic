'use client';
import { FileText, Video, Download, Eye, File, Image, Calendar } from 'lucide-react';

export default function Materials({ materials }: { materials: any[] }) {
  // Map database fields to component expected fields
  // Handle both old and new schema field names
  const mappedMaterials = materials.map((material: any) => ({
    id: material.id,
    type: material.material_type || material.type || 'pdf',
    url: material.file_url || material.url || '#',
    filename: material.title || material.filename || material.name || 'Untitled Resource',
    description: material.description || 'Session material',
    created_at: material.created_at,
    session_number: material.session_number,
  }));

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-6 h-6 text-red-500" />;
      case 'video': return <Video className="w-6 h-6 text-purple-500" />;
      case 'image': return <Image className="w-6 h-6 text-green-500" />;
      default: return <File className="w-6 h-6 text-slate-500" />;
    }
  };

  const getDocBg = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-50 border-red-200';
      case 'video': return 'bg-purple-50 border-purple-200';
      case 'image': return 'bg-green-50 border-green-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  if (!mappedMaterials || mappedMaterials.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
        <File className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700">No materials yet</h3>
        <p className="text-slate-500 mt-2">Your therapist will upload resources here after sessions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Session Materials</h2>
          <p className="text-sm text-slate-500">{mappedMaterials.length} document{mappedMaterials.length > 1 ? 's' : ''} available</p>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mappedMaterials.map((file) => (
          <div key={file.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${getDocBg(file.type)}`}>
                {getDocIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900 truncate">{file.filename || 'Untitled Resource'}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{file.description || 'Session material'}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(file.created_at).toLocaleDateString()}
                  {file.session_number && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                      Session {file.session_number}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View
              </a>
              <a
                href={file.url}
                download
                className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
