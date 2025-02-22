import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="bg-blue-600 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-white text-xl font-bold">DigiSign</h1>
                <div className="space-x-4">
                    <Link to="/" className="text-white">Home</Link>
                    <Link to="/sign" className="text-white">Sign</Link>
                    <Link to="/verify" className="text-white">Verify</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;