import React, { useEffect, useState } from 'react';
import { benchmarkApi } from '../api/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Activity, Shield, Cpu, Zap, Download, RefreshCw, Info, Database } from 'lucide-react';

const BenchmarkDashboard: React.FC = () => {
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchBenchmarks = async () => {
    setLoading(true);
    try {
      const res = await benchmarkApi.getAll();
      setBenchmarks(res.data);
    } catch (err) {
      console.error("Failed to fetch benchmarks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  const handleRunBenchmark = async () => {
    setRunning(true);
    try {
      await benchmarkApi.run({
        runs_small: 10,
        runs_medium: 5
      });
      await fetchBenchmarks();
    } catch (err) {
      console.error("Failed to run benchmark", err);
      alert("Failed to run benchmark. Ensure backend is running.");
    } finally {
      setRunning(false);
    }
  };

  // Prepare data for charts
  const latestSmall = benchmarks.filter(b => b.profile_name === 'Small Payload').slice(-2).reverse();
  const latestMedium = benchmarks.filter(b => b.profile_name === 'Medium Payload').slice(-2).reverse();
  
  const chartData = [...latestSmall, ...latestMedium].map(b => ({
    name: `${b.algorithm} (${b.profile_name.split(' ')[0]})`,
    sign_ms: b.sign_ms_avg,
    verify_ms: b.verify_ms_avg,
    sig_size: b.sig_bytes,
    pubkey_size: b.pubkey_bytes
  }));

  if (loading && benchmarks.length === 0) return <div className="text-center py-20 font-serif text-2xl">Analyzing Cryptographic Metrics...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif text-stone-900">Cryptographic Benchmarks</h2>
          <p className="text-stone-500">Comparative Analysis: Classical RSA vs. Quantum-Safe ML-DSA</p>
        </div>
        <button 
          onClick={handleRunBenchmark}
          disabled={running}
          className="bg-stone-900 text-heritage-gold px-6 py-2 rounded shadow-md hover:bg-black transition-colors flex items-center space-x-2 font-bold uppercase tracking-widest text-xs"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          <span>{running ? 'Running Suite...' : 'Run New Benchmark'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
          <div className="flex items-center space-x-3 text-stone-400 mb-4">
            <Cpu className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-widest">Compute Efficiency</h4>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            ML-DSA typically offers faster signing and verification than RSA, but at the cost of significantly larger signatures and public keys.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
          <div className="flex items-center space-x-3 text-stone-400 mb-4">
            <Shield className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-widest">Quantum Resistance</h4>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            RSA-3072 provides ~128-bit classical security but 0-bit quantum security. ML-DSA-65 provides Category 3 quantum security.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
          <div className="flex items-center space-x-3 text-stone-400 mb-4">
            <Activity className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-widest">Storage Overhead</h4>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            Preserving metadata with PQC increases certificate size by 10x-50x compared to classical methods.
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timing Chart */}
        <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
          <h3 className="text-lg font-serif mb-6 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-heritage-red" /> Execution Time (ms)
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} label={{ value: 'Milliseconds', angle: -90, position: 'insideLeft', style: {fontSize: 10} }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '4px', color: '#fff' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar name="Signing Time" dataKey="sign_ms" fill="#b91c1c" radius={[4, 4, 0, 0]} />
                <Bar name="Verification Time" dataKey="verify_ms" fill="#1e293b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Size Chart */}
        <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
          <h3 className="text-lg font-serif mb-6 flex items-center">
            <Database className="w-4 h-4 mr-2 text-blue-600" /> Signature & Key Size (Bytes)
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" />
                <XAxis type="number" tick={{fontSize: 10}} />
                <YAxis dataKey="name" type="category" tick={{fontSize: 10}} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '4px', color: '#fff' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar name="Signature Size" dataKey="sig_size" fill="#d97706" radius={[0, 4, 4, 0]} />
                <Bar name="Public Key Size" dataKey="pubkey_size" fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Raw Data Table */}
      <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <h3 className="text-sm font-bold uppercase tracking-widest text-stone-600">Historical Benchmark Results</h3>
          <button className="text-xs text-stone-500 flex items-center hover:text-stone-900">
            <Download className="w-3 h-3 mr-1" /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold tracking-tighter">
              <tr>
                <th className="px-6 py-3">Profile</th>
                <th className="px-6 py-3">Algorithm</th>
                <th className="px-6 py-3">Avg Keygen (ms)</th>
                <th className="px-6 py-3">Avg Sign (ms)</th>
                <th className="px-6 py-3">Avg Verify (ms)</th>
                <th className="px-6 py-3">Sig Size (B)</th>
                <th className="px-6 py-3">Overhead (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {benchmarks.slice().reverse().map((b) => (
                <tr key={b.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{b.profile_name}</td>
                  <td className="px-6 py-4 font-mono text-xs">{b.algorithm}</td>
                  <td className="px-6 py-4">{b.keygen_ms_avg.toFixed(2)}</td>
                  <td className="px-6 py-4">{b.sign_ms_avg.toFixed(2)}</td>
                  <td className="px-6 py-4">{b.verify_ms_avg.toFixed(2)}</td>
                  <td className="px-6 py-4">{b.sig_bytes}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${b.overhead_percent > 500 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {b.overhead_percent.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-stone-100 p-6 rounded-lg flex items-start space-x-4 border border-stone-200">
        <Info className="w-6 h-6 text-stone-400 mt-1" />
        <div className="space-y-2">
          <h4 className="font-bold text-stone-700 text-sm">Understanding these metrics</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Key sizes and signature sizes are critical for long-term storage in heritage archives. 
            While RSA-PSS is the current industry standard, its 128-bit security level is vulnerable to 
            Shor's algorithm on a sufficiently large quantum computer. ML-DSA (Module-Lattice-based Digital Signature Algorithm) 
            is part of the NIST Post-Quantum Cryptography standardization process. 
            This dashboard uses a <strong>Mock Educational Backend</strong> to simulate these values when a native PQC library is not available.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkDashboard;
