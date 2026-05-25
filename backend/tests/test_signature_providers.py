from app.services.rsa_provider import RSAPSSProvider
from app.services.mock_pq_provider import MockPQProvider

def test_rsa_flow():
    provider = RSAPSSProvider()
    priv, pub = provider.generate_keypair()
    msg = b"Hello Heritage"
    sig = provider.sign(priv, msg)
    assert provider.verify(pub, msg, sig) is True
    assert provider.verify(pub, b"Tampered", sig) is False

def test_mock_pq_flow():
    provider = MockPQProvider()
    priv, pub = provider.generate_keypair()
    msg = b"Hello Heritage"
    sig = provider.sign(priv, msg)
    assert provider.verify(pub, msg, sig) is True
