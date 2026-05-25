import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetApi } from '../api/client';
import { Upload, FileText, MapPin, Info, Shield, CheckCircle2 } from 'lucide-react';

const UploadAsset: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'TANGIBLE',
    heritage_type: 'image',
    location: '',
    description: '',
    source: '',
    signer_algorithm: 'RSA-PSS-3072'
  });
  const [file, setFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to preserve.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      data.append('file', file);

      const response = await assetApi.create(data);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/assets/${response.data.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to upload asset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in zoom-in duration-300">
        <CheckCircle2 className="w-16 h-16 text-green-600" />
        <h2 className="text-2xl font-serif text-stone-900">Asset Preserved Successfully</h2>
        <p className="text-stone-500">Generating digital certificate and cryptographic signatures...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-serif text-stone-900">Preserve Heritage Asset</h2>
        <p className="text-stone-500">Register and cryptographically sign digital heritage artifacts.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-lg shadow-sm border border-stone-200">
        {/* Left Column: Metadata */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-stone-400" /> Asset Title
            </label>
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-stone-300 rounded focus:ring-2 focus:ring-heritage-red focus:border-transparent outline-none transition-all"
              placeholder="e.g. Tranh Đông Hồ - Đám cưới chuột"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-stone-300 rounded bg-stone-50 outline-none"
              >
                <option value="TANGIBLE">Tangible</option>
                <option value="INTANGIBLE">Intangible</option>
                <option value="DOCUMENTARY">Documentary</option>
                <option value="NATURAL">Natural</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Type</label>
              <select
                name="heritage_type"
                value={formData.heritage_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-stone-300 rounded bg-stone-50 outline-none"
              >
                <option value="image">Image</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="3d_scan">3D Scan</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-stone-400" /> Location / Province
            </label>
            <input
              required
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-stone-300 rounded outline-none"
              placeholder="e.g. Bắc Ninh, Vietnam"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700 flex items-center">
              <Info className="w-4 h-4 mr-2 text-stone-400" /> Description
            </label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-stone-300 rounded outline-none"
              placeholder="Historical significance and preservation details..."
            />
          </div>
        </div>

        {/* Right Column: File & Security */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Source / Owner</label>
            <input
              required
              type="text"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-stone-300 rounded outline-none"
              placeholder="e.g. National Museum of History"
            />
          </div>

          <div className="p-6 border-2 border-dashed border-stone-200 rounded-lg bg-stone-50 space-y-4 text-center">
            <Upload className="w-10 h-10 mx-auto text-stone-300" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-stone-700">Upload Digital Asset</p>
              <p className="text-xs text-stone-500">PDF, JPG, PNG, MP3 up to 20MB</p>
            </div>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300 cursor-pointer"
            />
            {file && <p className="text-xs text-green-600 font-medium">Selected: {file.name}</p>}
          </div>

          <div className="bg-stone-900 text-stone-100 p-6 rounded-lg space-y-4 shadow-inner">
            <div className="flex items-center space-x-2 text-heritage-gold">
              <Shield className="w-5 h-5" />
              <h3 className="font-serif uppercase tracking-wider text-sm">Security Configuration</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-stone-400 uppercase tracking-widest">Signature Algorithm</label>
              <select
                name="signer_algorithm"
                value={formData.signer_algorithm}
                onChange={handleInputChange}
                className="w-full bg-stone-800 border border-stone-700 rounded px-3 py-2 text-sm outline-none text-white"
              >
                <optgroup label="Classical (Standard)">
                  <option value="RSA-PSS-3072">RSA-PSS-3072 (SHA-256)</option>
                </optgroup>
                <optgroup label="Quantum-Safe (Evaluation)">
                  <option value="Mock-ML-DSA-65">ML-DSA-65 (Mock Backend)</option>
                </optgroup>
              </select>
            </div>
            
            <p className="text-[10px] text-stone-500 italic">
              * Choosing ML-DSA will evaluate post-quantum signature overheads.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-heritage-red text-white py-3 rounded font-bold shadow-lg hover:bg-red-800 disabled:bg-stone-400 transition-all flex justify-center items-center space-x-2"
          >
            {loading ? (
              <span className="animate-pulse">Preserving...</span>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Digitally Sign & Preserve</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadAsset;
