'use client';
import { useState } from 'react';
import { Upload, Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function UploadMaterial({ sessionId, onUploadComplete }: { sessionId: string, onUploadComplete: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    setCompleted(false);
    const file = e.target.files[0];
    const type = file.type.startsWith('image') || file.type.includes('pdf') ? 'document' : 'media'; // simplified type check
    
    // 1. Upload to Supabase Storage
    const path = `${sessionId}/${type}/${Date.now()}_${file.name}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('session-materials')
      .upload(path, file);

    if (storageError) {
      console.error(storageError);
      alert('Upload failed: ' + storageError.message);
      setUploading(false);
      return;
    }

    // 2. Create DB record via API (fetching public URL first? Or stored relative path?)
    // Using relative path or generating public URL.
    const { data: { publicUrl } } = supabase.storage.from('session-materials').getPublicUrl(path);

    try {
      const res = await fetch('/api/uploads/session-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          type: type === 'media' ? 'video' : 'pdf', // normalize to enum likely
          filename: file.name,
          url: publicUrl,
          description: 'Therapist upload' // Default
        })
      });
      
      if (!res.ok) throw new Error('DB Save Failed');
      
      setCompleted(true);
      onUploadComplete();
      
      setTimeout(() => setCompleted(false), 2000);
    } catch (err) {
      console.error(err);
      alert('File uploaded but record failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
     <div className="relative inline-block">
       <input 
          type="file" 
          id={`upload-${sessionId}`} 
          className="hidden" 
          onChange={handleUpload}
          disabled={uploading}
       />
       <label 
         htmlFor={`upload-${sessionId}`}
         className={`inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded cursor-pointer ${uploading ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
       >
         {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : completed ? <Check className="w-3 h-3 text-green-600" /> : <Upload className="w-3 h-3 mr-1" />}
         {uploading ? '' : completed ? 'Saved' : 'Upload'}
       </label>
     </div>
  );
}
