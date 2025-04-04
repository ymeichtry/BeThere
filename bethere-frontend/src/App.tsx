import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Search from "./pages/Search";
import HostParty from "./pages/HostParty";
import Settings from "./pages/Settings";
import Navbar from "./components/navbar/Navbar";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/host" element={<HostParty />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
      <Navbar />
    </Router>
  );
}

export default App;
