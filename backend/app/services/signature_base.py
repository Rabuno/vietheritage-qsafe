from abc import ABC, abstractmethod

class SignatureProvider(ABC):
    @abstractmethod
    def generate_keypair(self): pass
    
    @abstractmethod
    def sign(self, private_key, message: bytes) -> bytes: pass
    
    @abstractmethod
    def verify(self, public_key, message: bytes, signature: bytes) -> bool: pass
    
    @abstractmethod
    def get_algorithm_name(self) -> str: pass
