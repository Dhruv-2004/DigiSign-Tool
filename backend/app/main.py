from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
import os

app = FastAPI()

# 🔹 Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
) 

# 🔹 Define directory for signed files
SIGNED_FILES_DIR = "signed_files"
os.makedirs(SIGNED_FILES_DIR, exist_ok=True)

# 🔹 Serve signed files via static route
app.mount("/signed_files", StaticFiles(directory=SIGNED_FILES_DIR), name="signed_files")

# 🔹 Define key file paths
PRIVATE_KEY_FILE = "private_key.pem"
PUBLIC_KEY_FILE = "public_key.pem"

# 🔹 Load or Generate RSA Key Pair
if os.path.exists(PRIVATE_KEY_FILE) and os.path.exists(PUBLIC_KEY_FILE):
    # Load existing keys
    with open(PRIVATE_KEY_FILE, "rb") as priv_file:
        private_key = serialization.load_pem_private_key(priv_file.read(), password=None)
    with open(PUBLIC_KEY_FILE, "rb") as pub_file:
        public_key = serialization.load_pem_public_key(pub_file.read())
else:
    # Generate new key pair
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public_key = private_key.public_key()

    # Save private key
    with open(PRIVATE_KEY_FILE, "wb") as priv_file:
        priv_file.write(
            private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.TraditionalOpenSSL,
                encryption_algorithm=serialization.NoEncryption(),
            )
        )

    # Save public key
    with open(PUBLIC_KEY_FILE, "wb") as pub_file:
        pub_file.write(
            public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo,
            )
        )

@app.post("/sign")
async def sign_document(file: UploadFile = File(...)):
    """Sign the uploaded file and return the signature file URL"""
    try:
        # 🔹 Read file content
        file_data = await file.read()

        # 🔹 Generate digital signature
        signature = private_key.sign(
            file_data,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH,
            ),
            hashes.SHA256(),
        )

        # 🔹 Save signature file inside `signed_files/`
        signature_filename = f"signed_{file.filename}.sig"
        signature_path = os.path.join(SIGNED_FILES_DIR, signature_filename)

        with open(signature_path, "wb") as sig_file:
            sig_file.write(signature)

        return {
            "message": "File signed successfully",
            "signature_file": f"/signed_files/{signature_filename}",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signing failed: {str(e)}")

@app.get("/download/{filename}")
async def download_signature(filename: str):
    """Download the signed signature file"""
    file_path = os.path.join(SIGNED_FILES_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, filename=filename)

@app.post("/verify")
async def verify_signature(file: UploadFile = File(...), signature_file: UploadFile = File(...)):
    """Verify the uploaded file using the provided signature"""
    try:
        # 🔹 Read both files
        file_data = await file.read()
        signature = await signature_file.read()

        # 🔹 Verify signature
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