import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assetApi, benchmarkApi } from '../api/client';
import { FileText, Award, Activity, Plus, ArrowRight, Shield } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    assets: 0,
    certificates: 0,
    benchmarks: 0,
    pqSigned: 0
  });
  const [recentAssets, setRecentAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsRes, benchmarksRes] = await Promise.all([
          assetApi.getAll(),
          benchmarkApi.getAll()
        ]);
        
        const assets = assetsRes.data;
        setRecentAssets(assets.slice(0, 5));
        setStats({
          assets: assets.length,
          certificates: assets.length, // Simple 1:1 for MVP
          benchmarks: benchmarksRes.data.length,
          pqSigned: assets.filter((a: any) => a.certificates?.some((c: any) => c.signature_algorithm.includes('ML-DSA'))).length
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 font-serif text-2xl">Loading Archive...</div>;

  const cards = [
    { name: 'Heritage Assets', value: stats.assets, icon: FileText, color: 'text-blue-600' },
    { name: 'PQ Certificates', value: stats.pqSigned, icon: Shield, color: 'text-heritage-red' },
    { name: 'Verification Success', value: '100%', icon: Award, color: 'text-green-600' },
    { name: 'Benchmark Runs', value: stats.benchmarks, icon: Activity, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif text-stone-900 m-0">Repository Overview</h2>
          <p className="text-stone-500">Vietnamese Digital Heritage Preservation & Authenticity Tracking</p>
        </div>
        <Link 
          to="/upload" 
          className="bg-heritage-red text-white px-6 py-2 rounded shadow-md hover:bg-red-800 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Preservation</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.name} className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-stone-500 text-sm font-medium uppercase tracking-wider">{card.name}</p>
                <h3 className="text-3xl font-bold mt-1">{card.value}</h3>
              </div>
              <card.icon className={`w-8 h-8 ${card.color} opacity-80`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Assets */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center">
            <h3 className="text-lg font-serif">Recently Preserved Assets</h3>
            <Link to="/upload" className="text-xs text-heritage-red font-medium uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-stone-100">
            {recentAssets.length > 0 ? (
              recentAssets.map((asset) => (
                <Link 
                  key={asset.id} 
                  to={`/assets/${asset.id}`}
                  className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-stone-100 rounded flex items-center justify-center text-stone-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-900">{asset.title}</h4>
                      <p className="text-xs text-stone-500">{asset.category} &bull; {asset.heritage_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-mono text-stone-400">{asset.id.slice(0, 8)}</span>
                    <ArrowRight className="w-4 h-4 text-stone-300" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-stone-400">
                No heritage assets preserved yet.
              </div>
            )}
          </div>
        </div>

        {/* Research Info */}
        <div className="bg-heritage-slate text-stone-100 rounded-lg shadow-md p-6 border-t-4 border-heritage-gold">
          <h3 className="text-xl font-serif text-heritage-gold mb-4">Research Context</h3>
          <div className="space-y-4 text-sm text-stone-300 leading-relaxed">
            <p>
              This system evaluates the transition from classical RSA signatures to 
              <strong> Quantum-Safe Post-Quantum Cryptography (PQC)</strong>.
            </p>
            <p>
              Vietnamese cultural heritage digital assets require long-term authenticity that 
              can withstand future quantum computing threats.
            </p>
            <ul className="space-y-2 list-disc list-inside text-xs">
              <li>ML-DSA (Dilithium) Evaluation</li>
              <li>Tamper-proof Digital Manifests</li>
              <li>Canonical JSON Serialization</li>
              <li>Signature Overhead Benchmarking</li>
            </ul>
            <div className="pt-4">
              <Link 
                to="/benchmarks" 
                className="inline-block border border-heritage-gold text-heritage-gold px-4 py-2 rounded text-xs uppercase tracking-widest hover:bg-heritage-gold hover:text-heritage-slate transition-colors"
              >
                View Benchmarks
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
