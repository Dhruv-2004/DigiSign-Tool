import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"; // Make sure this file exists
import Sign from "./pages/Sign";
import Verify from "./pages/Verify";
import Navbar from "./components/Navbar"; // Ensure Navbar.js is inside src/components/

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sign" element={<Sign />} />
                <Route path="/verify" element={<Verify />} />
            </Routes>
        </Router>
    );
}

export default App;