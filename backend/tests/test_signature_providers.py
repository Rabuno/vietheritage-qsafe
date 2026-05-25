from app.services.rsa_provider import RSAPSSSignatureProvider
from app.services.mock_pq_provider import MockPQSignatureProvider

def test_rsa_flow():
    provider = RSAPSSSignatureProvider()
    priv, pub = provider.generate_keypair()
    msg = b"Hello Heritage"
    sig = provider.sign(priv, msg)
    assert provider.verify(pub, msg, sig) is True
    assert provider.verify(pub, b"Tampered", sig) is False

def test_mock_pq_flow():
    provider = MockPQSignatureProvider()
    priv, pub = provider.generate_keypair()
    msg = b"Hello Heritage"
    sig = provider.sign(priv, msg)
    assert provider.verify(pub, msg, sig) is True
    assert provider.verify(pub, b"Tampered", sig) is False
