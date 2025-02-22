import React, { useState } from "react";
import axios from "axios";

const Sign = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://127.0.0.1:8000/sign", formData);
            alert(response.data.message);
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Sign a Document</h1>
            <input type="file" onChange={handleFileChange} className="mt-2" />
            <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 mt-2 rounded">
                Upload & Sign
            </button>
        </div>
    );
};

export default Sign;