import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assetApi, verifyApi } from '../api/client';
import { 
  Shield, Calendar, MapPin, CheckCircle, 
  AlertTriangle, Copy, Download, RefreshCw, Database
} from 'lucide-react';

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [manifestEdit, setManifestEdit] = useState("");

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await assetApi.getById(id!);
        setAsset(res.data);
        if (res.data.certificates && res.data.certificates.length > 0) {
          setManifestEdit(res.data.certificates[0].manifest_json);
        }
      } catch (err) {
        console.error("Failed to fetch asset", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  const handleVerifyManifest = async () => {
    setVerifying(true);
    try {
      const res = await verifyApi.verifyManifest({
        asset_id: id!,
        manifest_json: manifestEdit
      });
      setVerifyResult(res.data);
    } catch (err: any) {
      setVerifyResult({
        valid: false,
        message: err.response?.data?.detail || "Verification failed."
      });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  if (loading) return <div className="text-center py-20 font-serif text-2xl">Retrieving Heritage Record...</div>;
  if (!asset) return <div className="text-center py-20 text-red-600">Asset not found.</div>;

  const latestCert = asset.certificates?.[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 text-stone-500 text-sm uppercase tracking-widest mb-2">
            <Link to="/" className="hover:text-heritage-red transition-colors">Archive</Link>
            <span>/</span>
            <span>{asset.category}</span>
          </div>
          <h2 className="text-4xl font-serif text-stone-900">{asset.title}</h2>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-stone-300 rounded hover:bg-stone-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Metadata */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200 space-y-6">
            <h3 className="text-xl font-serif border-b border-stone-100 pb-4">Metadata Profile</h3>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-12 text-sm">
              <div className="space-y-1">
                <p className="text-stone-400 uppercase tracking-tighter text-[10px] font-bold">Category</p>
                <p className="font-medium text-stone-900 flex items-center">
                  <Database className="w-3 h-3 mr-2 text-stone-400" /> {asset.category}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-stone-400 uppercase tracking-tighter text-[10px] font-bold">Heritage Type</p>
                <p className="font-medium text-stone-900">{asset.heritage_type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-stone-400 uppercase tracking-tighter text-[10px] font-bold">Location</p>
                <p className="font-medium text-stone-900 flex items-center">
                  <MapPin className="w-3 h-3 mr-2 text-stone-400" /> {asset.location}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-stone-400 uppercase tracking-tighter text-[10px] font-bold">Digitized On</p>
                <p className="font-medium text-stone-900 flex items-center">
                  <Calendar className="w-3 h-3 mr-2 text-stone-400" /> {new Date(asset.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-stone-400 uppercase tracking-tighter text-[10px] font-bold">Description</p>
              <p className="text-stone-700 leading-relaxed italic">{asset.description}</p>
            </div>

            <div className="pt-4 space-y-3">
              <div className="p-3 bg-stone-50 rounded border border-stone-100 flex items-center justify-between font-mono text-xs">
                <span className="text-stone-400 uppercase mr-4">SHA-256</span>
                <span className="text-stone-600 break-all">{asset.sha256}</span>
                <button onClick={() => copyToClipboard(asset.sha256)} className="ml-2 text-stone-400 hover:text-stone-600"><Copy className="w-3 h-3" /></button>
              </div>
              <div className="p-3 bg-stone-50 rounded border border-stone-100 flex items-center justify-between font-mono text-xs">
                <span className="text-stone-400 uppercase mr-4">Metadata Hash</span>
                <span className="text-stone-600 break-all">{asset.metadata_hash}</span>
                <button onClick={() => copyToClipboard(asset.metadata_hash)} className="ml-2 text-stone-400 hover:text-stone-600"><Copy className="w-3 h-3" /></button>
              </div>
            </div>
          </div>

          {/* Tamper Demo Section */}
          <div className="bg-stone-50 p-8 rounded-lg border-2 border-stone-200 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-heritage-red" />
                <h3 className="text-xl font-serif">Live Tamper Demo</h3>
              </div>
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest bg-stone-200 px-2 py-1 rounded">Interactive Lab</div>
            </div>
            
            <p className="text-sm text-stone-600 leading-relaxed">
              Edit the <strong>Canonical Manifest</strong> below to simulate a data breach or tampering attempt. 
              The signature will no longer match if even a single character is changed.
            </p>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-stone-400 uppercase">Signed Manifest (JSON)</label>
                <button 
                  onClick={() => latestCert && setManifestEdit(latestCert.manifest_json)}
                  className="text-[10px] text-heritage-red uppercase font-bold hover:underline"
                >
                  Reset Manifest
                </button>
              </div>
              <textarea
                value={manifestEdit}
                onChange={(e) => setManifestEdit(e.target.value)}
                className="w-full h-48 p-4 bg-stone-900 text-green-400 font-mono text-xs rounded border border-stone-700 focus:ring-2 focus:ring-heritage-red outline-none"
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleVerifyManifest}
                disabled={verifying}
                className="bg-heritage-red text-white px-8 py-3 rounded font-bold shadow-md hover:bg-red-800 disabled:bg-stone-400 transition-all flex items-center space-x-2"
              >
                {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                <span>Verify Signature Integrity</span>
              </button>

              {verifyResult && (
                <div className={`flex items-center space-x-2 font-bold animate-in fade-in slide-in-from-left-2 ${verifyResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {verifyResult.valid ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  <span>{verifyResult.valid ? "Integrity Verified" : "Tampering Detected"}</span>
                </div>
              )}
            </div>

            {verifyResult && !verifyResult.valid && (
              <p className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100">
                Error: {verifyResult.message}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar: Certificate */}
        <div className="space-y-8">
          {latestCert ? (
            <div className="bg-heritage-slate text-stone-100 rounded-lg shadow-xl overflow-hidden border-t-4 border-heritage-gold">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <Shield className="w-8 h-8 text-heritage-gold" />
                  <div className="text-right">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Algorithm</p>
                    <p className="text-xs font-mono text-heritage-gold">{latestCert.signature_algorithm}</p>
                  </div>
                </div>

                <div className="text-center py-4 border-y border-stone-700">
                  <h4 className="font-serif text-heritage-gold uppercase tracking-tighter">Digital Authenticity Certificate</h4>
                  <p className="text-[10px] text-stone-400 mt-1">Verified via {latestCert.signature_algorithm.includes('Mock') ? 'Educational PQC' : 'Standard RSA'}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-stone-400 uppercase font-bold">Signature Fingerprint</p>
                    <p className="text-[10px] font-mono break-all text-stone-300">{latestCert.public_key_fingerprint}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-stone-400 uppercase font-bold">Signed Date</p>
                    <p className="text-xs text-stone-200">{new Date(latestCert.signed_at).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-stone-400 uppercase font-bold">Signature Size</p>
                    <p className="text-xs text-stone-200">{latestCert.signature_size_bytes} bytes</p>
                  </div>
                </div>

                <div className="pt-4 flex flex-col space-y-2">
                  <button className="w-full bg-stone-100 text-stone-900 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-heritage-gold transition-colors">
                    Export Certificate (JSON)
                  </button>
                  <button className="w-full border border-stone-600 text-stone-400 py-2 rounded text-xs font-bold uppercase tracking-widest hover:text-white hover:border-white transition-colors">
                    View Public Verifier
                  </button>
                </div>
              </div>
              <div className="bg-stone-950 px-6 py-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-stone-500">
                <span>Status: {latestCert.verification_status}</span>
                <span>V1.0</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-stone-100 rounded-lg text-stone-400 text-sm border-2 border-dashed border-stone-200">
              No digital certificates generated for this asset.
            </div>
          )}

          {/* Educational Note */}
          <div className="bg-white p-6 rounded-lg border border-stone-200 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-2">Research Impact</h4>
            <p className="text-xs text-stone-500 leading-relaxed italic">
              "The use of {latestCert?.signature_algorithm.includes('ML-DSA') ? 'Post-Quantum' : 'Classical'} signatures 
              ensures the integrity of this heritage asset against {latestCert?.signature_algorithm.includes('ML-DSA') ? 'future quantum-enabled' : 'modern classical'} 
              adversaries. Notice the signature size difference in our benchmark dashboard."
            </p>
            <Link to="/benchmarks" className="text-xs text-heritage-red font-bold flex items-center hover:underline">
              Compare Metrics <RefreshCw className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
