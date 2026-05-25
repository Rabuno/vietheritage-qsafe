import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const assetApi = {
  getAll: () => client.get('/assets'),
  getById: (id: string) => client.get(`/assets/${id}`),
  create: (formData: FormData) => client.post('/assets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const benchmarkApi = {
  run: (config: any) => client.post('/benchmarks/run', config),
  getAll: () => client.get('/benchmarks'),
};

export const verifyApi = {
  getCertificate: (id: string) => client.get(`/certificates/${id}`),
  verifyFile: (certId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post(`/verify/${certId}/file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  tamperDemo: (certId: string) => client.post(`/verify/${certId}/tamper-demo`),
  // Live verification of manifest
  verifyManifest: (data: { asset_id: string; manifest_json: string }) => client.post('/verify/manifest', data),
};

export default client;
