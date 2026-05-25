import os
import time
import base64
from .signature_base import SignatureProvider

class MockPQProvider(SignatureProvider):
    def get_algorithm_name(self): return "Mock-ML-DSA-65"
    
    def generate_keypair(self):
        # Simulate ML-DSA-65 key sizes (approx 1952 public, 4000 private)
        return os.urandom(4000), os.urandom(1952)
        
    def sign(self, private_key, message: bytes) -> bytes:
        # Simulate ML-DSA-65 signing time (approx 1-5ms) and size (3309 bytes)
        time.sleep(0.002) 
        return os.urandom(3309)
        
    def verify(self, public_key, message: bytes, signature: bytes) -> bool:
        # Simulate verification time
        time.sleep(0.001)
        return True # Always valid for mock
