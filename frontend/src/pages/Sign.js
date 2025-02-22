import React, { useState } from "react";
import axios from "axios";

const Sign = () => {
    const [file, setFile] = useState(null);
    const [signatureFile, setSignatureFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage("");
        setSignatureFile(null);
    };

    const handleRemoveFile = () => {
        setFile(null);
        setMessage("");
        setSignatureFile(null);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file!");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://127.0.0.1:8000/sign", formData);
            setMessage(response.data.message);
            setSignatureFile(response.data.signature_file);
        } catch (error) {
            console.error("Error signing document:", error.response ? error.response.data : error.message);
            setMessage("Error signing the document. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">Sign a Document</h1>

            <div className="flex flex-col items-center space-y-4">
                {/* File Upload Input */}
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="border p-2 rounded w-full cursor-pointer"
                />
                
                {/* Selected File Display */}
                {file && (
                    <div className="bg-gray-100 p-2 rounded w-full flex justify-between items-center">
                        <span className="text-gray-700">{file.name}</span>
                        <button
                            onClick={handleRemoveFile}
                            className="text-red-500 text-sm font-semibold hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                )}

                {/* Upload Button */}
                <button 
                    onClick={handleUpload} 
                    className={`w-full px-4 py-2 rounded text-white transition ${
                        loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={loading}
                >
                    {loading ? "Signing..." : "Upload & Sign"}
                </button>

                {/* Download Link */}
                {signatureFile && (
                    <a 
                        href={`http://127.0.0.1:8000${signatureFile}`}  
                        download 
                        className="text-green-600 font-semibold mt-2 hover:underline"
                    >
                        Download Signature File
                    </a>
                )}

                {/* Message */}
                {message && <p className="mt-2 text-gray-700">{message}</p>}
            </div>
        </div>
    );
};

export default Sign;