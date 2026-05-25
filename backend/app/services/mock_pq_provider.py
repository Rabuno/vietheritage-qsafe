import os
import time
import hashlib
from .signature_base import SignatureProvider

class MockPQSignatureProvider(SignatureProvider):
    def name(self) -> str: return "Mock-ML-DSA-65"
    def backend(self) -> str: return "Mock-Educational-Backend"
    
    def generate_keypair(self):
        # Simulate ML-DSA-65 key sizes (approx 1952 public, 4000 private)
        return os.urandom(4000), os.urandom(1952)
        
    def sign(self, private_key, message: bytes) -> bytes:
        # Simulate ML-DSA-65 signing time (approx 1-5ms) and size (3309 bytes)
        time.sleep(0.002) 
        h = hashlib.sha256(message).digest()
        # Mock signature: hash of message + some padding to reach 3309 bytes
        return h + os.urandom(3309 - len(h))
        
    def verify(self, public_key, message: bytes, signature: bytes) -> bool:
        # Simulate verification time
        time.sleep(0.001)
        # Verify by checking if the signature starts with the hash of the current message
        h = hashlib.sha256(message).digest()
        return signature.startswith(h)

    def public_key_to_bytes(self, public_key) -> bytes:
        return public_key

    def private_key_to_bytes(self, private_key) -> bytes:
        return private_key
