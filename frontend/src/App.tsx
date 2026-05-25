import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UploadAsset from './pages/UploadAsset';
import AssetDetail from './pages/AssetDetail';
import BenchmarkDashboard from './pages/BenchmarkDashboard';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadAsset />} />
          <Route path="/assets/:id" element={<AssetDetail />} />
          <Route path="/benchmarks" element={<BenchmarkDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
