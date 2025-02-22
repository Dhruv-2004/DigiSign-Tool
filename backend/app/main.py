

from fastapi import FastAPI, File, UploadFile
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
import os

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Generate RSA key pair (Private and Public keys)
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
)

public_key = private_key.public_key()

# Save keys for reuse
PRIVATE_KEY_FILE = "private_key.pem"
PUBLIC_KEY_FILE = "public_key.pem"

if not os.path.exists(PRIVATE_KEY_FILE):
    with open(PRIVATE_KEY_FILE, "wb") as priv_file:
        priv_file.write(
            private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.TraditionalOpenSSL,
                encryption_algorithm=serialization.NoEncryption(),
            )
        )

    with open(PUBLIC_KEY_FILE, "wb") as pub_file:
        pub_file.write(
            public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo,
            )
        )


@app.post("/sign")
async def sign_document(file: UploadFile = File(...)):
    """Sign the uploaded file and return the signature"""
    file_data = await file.read()

    signature = private_key.sign(
        file_data,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH,
        ),
        hashes.SHA256(),
    )

    signature_file_path = f"signed_{file.filename}.sig"
    with open(signature_file_path, "wb") as sig_file:
        sig_file.write(signature)

    return {
        "message": "File signed successfully",
        "signature_file": signature_file_path,
    }

@app.post("/verify")
async def verify_signature(file: UploadFile = File(...), signature_file: UploadFile = File(...)):
    """Verify the uploaded file using the provided signature"""
    file_data = await file.read()
    signature = await signature_file.read()

    try:
        public_key.verify(
            signature,
            file_data,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH,
            ),
            hashes.SHA256(),
        )
        return {"message": "Signature is valid!"}
    except Exception as e:
        return {"message": f"Signature verification failed: {str(e)}"}