import { useCallback, useState } from 'react';
import api from '../../api/axios';

export default function ImageDropzone({ onUploaded, preview }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file) => {
    if (!file?.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded(data.url);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) upload(file);
    },
    [onUploaded]
  );

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 ${
          dragging ? 'border-accent bg-accent/5' : 'border-primary/20 bg-white hover:border-primary/40'
        }`}
      >
        {preview ? (
          <img src={preview} alt="Design preview" className="max-h-64 rounded-xl object-contain" />
        ) : (
          <>
            <svg className="h-12 w-12 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-3 text-sm font-medium text-charcoal/70">
              Drag & drop your design image here
            </p>
            <p className="mt-1 text-xs text-charcoal/40">PNG, JPG up to 10MB</p>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => e.target.files[0] && upload(e.target.files[0])}
          disabled={uploading}
        />
      </div>
      {uploading && <p className="mt-2 text-center text-sm text-primary">Uploading...</p>}
      {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
