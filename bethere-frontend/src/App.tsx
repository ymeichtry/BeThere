import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Search from "./pages/Search";
import HostParty from "./pages/HostParty";
import Settings from "./pages/Settings";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Navbar from "./components/navbar/Navbar";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/host" element={<HostParty />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </div>
      <Navbar />
    </Router>
  );
}

export default App;
