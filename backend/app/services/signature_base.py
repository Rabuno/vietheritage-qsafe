from abc import ABC, abstractmethod

class SignatureProvider(ABC):
    @abstractmethod
    def name(self) -> str: pass
    
    @abstractmethod
    def backend(self) -> str: pass

    @abstractmethod
    def generate_keypair(self): pass
    
    @abstractmethod
    def sign(self, private_key, message: bytes) -> bytes: pass
    
    @abstractmethod
    def verify(self, public_key, message: bytes, signature: bytes) -> bool: pass
    
    @abstractmethod
    def public_key_to_bytes(self, public_key) -> bytes: pass

    @abstractmethod
    def private_key_to_bytes(self, private_key) -> bytes: pass
