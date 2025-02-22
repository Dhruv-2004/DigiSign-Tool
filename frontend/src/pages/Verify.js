import React, { useState } from "react";

const Verify = () => {
    const [file, setFile] = useState(null);
    const [signature, setSignature] = useState(null);

    const handleFileChange = (event) => setFile(event.target.files[0]);
    const handleSignatureChange = (event) => setSignature(event.target.files[0]);

    const handleVerifyDocument = async () => {
        if (!file || !signature) {
            alert("Please upload both the document and its signature.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("signature_file", signature);

        try {
            const response = await fetch("http://127.0.0.1:8000/verify", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error("Error verifying document:", error);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-green-600">Verify a Document</h1>
            <p className="text-gray-600">Upload a document and its signature to verify.</p>

            <div className="mt-4">
                <input type="file" onChange={handleFileChange} className="border p-2" />
                <input type="file" onChange={handleSignatureChange} className="border p-2 ml-2" />
            </div>

            <button
                onClick={handleVerifyDocument}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
            >
                Verify Document
            </button>
        </div>
    );
};

export default Verify;