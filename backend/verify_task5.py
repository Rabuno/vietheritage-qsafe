import httpx
import os

def test_upload():
    url = "http://127.0.0.1:8000/api/assets"
    
    # Create a dummy file
    dummy_file_path = "dummy.txt"
    with open(dummy_file_path, "w") as f:
        f.write("This is a test heritage asset.")
        
    try:
        with open(dummy_file_path, "rb") as f:
            files = {"file": ("dummy.txt", f, "text/plain")}
            data = {
                "title": "Test Asset",
                "category": "TANGIBLE",
                "heritage_type": "text",
                "location": "Hanoi",
                "description": "A test asset for Task 5 verification.",
                "source": "Verification Script",
                "signer_algorithm": "RSA-PSS-3072"
            }
            response = httpx.post(url, data=data, files=files)
            print(f"Status Code: {response.status_code}")
            print(f"Response Body: {response.json()}")
    finally:
        if os.path.exists(dummy_file_path):
            os.remove(dummy_file_path)

if __name__ == "__main__":
    test_upload()
