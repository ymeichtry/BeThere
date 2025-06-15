import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthRequired from './components/AuthRequired';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterSuccess from './pages/RegisterSuccess';
import Search from './pages/Search';
import MapPage from './pages/MapPage';
import CreateParty from './pages/CreateParty';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import PartyDetail from './pages/PartyDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-success" element={<RegisterSuccess />} />
      
      {/* Protected routes */}
      <Route element={<AuthRequired />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/search" replace />} />
          <Route path="/search" element={<Search />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/create" element={<CreateParty />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/party/:id" element={<PartyDetail />} />
        </Route>
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;