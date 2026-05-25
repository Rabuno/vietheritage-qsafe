import time
import os
import uuid
from typing import List, Dict, Any
from .hash_service import compute_hashes
from .canonical_service import to_canonical_json
from .rsa_provider import RSAPSSSignatureProvider
from .mock_pq_provider import MockPQSignatureProvider
from ..models import BenchmarkResult

class BenchmarkService:
    def __init__(self):
        self.providers = [
            RSAPSSSignatureProvider(),
            MockPQSignatureProvider()
        ]
        
    def run_benchmarks(self, runs_small: int = 10, runs_medium: int = 5) -> List[BenchmarkResult]:
        results = []
        
        profiles = [
            {
                "name": "Small",
                "asset_size": 100 * 1024, # 100KB
                "payload_size": 2 * 1024,  # 2KB
                "iterations": runs_small
            },
            {
                "name": "Medium",
                "asset_size": 2 * 1024 * 1024, # 2MB
                "payload_size": 8 * 1024,      # 8KB
                "iterations": runs_medium
            }
        ]
        
        for profile in profiles:
            for provider in self.providers:
                result = self._benchmark_provider_profile(provider, profile)
                results.append(result)
                
        return results

    def _benchmark_provider_profile(self, provider: Any, profile: Dict[str, Any]) -> BenchmarkResult:
        iterations = profile["iterations"]
        asset_size = profile["asset_size"]
        payload_size = profile["payload_size"]
        
        total_keygen_time = 0.0
        total_hash_time = 0.0
        total_sign_time = 0.0
        total_verify_time = 0.0
        
        # We'll use these to get sizes from the last iteration
        pubkey_size = 0
        sig_size = 0
        
        # Prepare synthetic asset
        asset_bytes = os.urandom(asset_size)
        
        # Prepare synthetic payload for signing
        # We create a dict that would result in approx payload_size when canonicalized
        dummy_payload = {
            "asset_id": str(uuid.uuid4()),
            "data": "x" * (payload_size - 100) # minus some overhead for keys/uuid
        }
        payload_bytes = to_canonical_json(dummy_payload)

        for _ in range(iterations):
            # Keygen
            start = time.perf_counter()
            priv, pub = provider.generate_keypair()
            total_keygen_time += (time.perf_counter() - start)
            
            # Hashing
            start = time.perf_counter()
            compute_hashes(asset_bytes)
            total_hash_time += (time.perf_counter() - start)
            
            # Signing
            start = time.perf_counter()
            signature = provider.sign(priv, payload_bytes)
            total_sign_time += (time.perf_counter() - start)
            
            # Verification
            start = time.perf_counter()
            provider.verify(pub, payload_bytes, signature)
            total_verify_time += (time.perf_counter() - start)
            
            # Sizes (last iteration is fine as they are constant for the algorithm)
            pubkey_size = len(provider.public_key_to_bytes(pub))
            sig_size = len(signature)

        # Average and convert to ms
        keygen_ms = (total_keygen_time / iterations) * 1000
        hash_ms = (total_hash_time / iterations) * 1000
        sign_ms = (total_sign_time / iterations) * 1000
        verify_ms = (total_verify_time / iterations) * 1000
        
        cert_bytes = len(payload_bytes) + sig_size + pubkey_size
        overhead_percent = (cert_bytes / asset_size) * 100

        return BenchmarkResult(
            id=str(uuid.uuid4()),
            profile_name=profile["name"],
            algorithm=provider.name(),
            iterations=iterations,
            asset_size_bytes=asset_size,
            cert_payload_size_bytes=len(payload_bytes),
            keygen_ms_avg=keygen_ms,
            hash_ms_avg=hash_ms,
            sign_ms_avg=sign_ms,
            verify_ms_avg=verify_ms,
            pubkey_bytes=pubkey_size,
            sig_bytes=sig_size,
            cert_bytes=cert_bytes,
            overhead_percent=overhead_percent
        )
