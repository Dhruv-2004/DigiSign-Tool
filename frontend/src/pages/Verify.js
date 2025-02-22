import React, { useState } from "react";

const Verify = () => {
    const [file, setFile] = useState(null);
    const [signature, setSignature] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage("");
    };

    const handleSignatureChange = (e) => {
        setSignature(e.target.files[0]);
        setMessage("");
    };

    const handleRemoveFile = () => {
        setFile(null);
        setMessage("");
    };

    const handleRemoveSignature = () => {
        setSignature(null);
        setMessage("");
    };

    const handleVerifyDocument = async () => {
        if (!file || !signature) {
            alert("Please upload both the document and its signature.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("signature_file", signature);

        try {
            const response = await fetch("http://127.0.0.1:8000/verify", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            setMessage(data.message);
        } catch (error) {
            console.error("Error verifying document:", error);
            setMessage("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-lg mx-auto bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold text-center mb-4">Verify a Document</h1>

            <div className="flex flex-col items-center space-y-2">
                <input type="file" onChange={handleFileChange} className="border p-2 rounded" />
                {file && (
                    <div className="bg-gray-100 p-2 rounded w-full text-center">
                        <span className="text-gray-700">{file.name}</span>
                        <button 
                            onClick={handleRemoveFile} 
                            className="text-red-500 ml-2 text-sm font-semibold hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                )}

                <input type="file" onChange={handleSignatureChange} className="border p-2 rounded" />
                {signature && (
                    <div className="bg-gray-100 p-2 rounded w-full text-center">
                        <span className="text-gray-700">{signature.name}</span>
                        <button 
                            onClick={handleRemoveSignature} 
                            className="text-red-500 ml-2 text-sm font-semibold hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                )}

                <button 
                    onClick={handleVerifyDocument} 
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    disabled={loading}
                >
                    {loading ? "Verifying..." : "Verify Document"}
                </button>

                {message && <p className="mt-2 text-green-600">{message}</p>}
            </div>
        </div>
    );
};

export default Verify;