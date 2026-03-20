import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PresentationView from './pages/PresentationView';
import AccountSettings from './pages/AccountSettings';
import Presentations from './pages/admin/Presentations';
import Categories from './pages/admin/Categories';
import Users from './pages/admin/Users';
import Groups from './pages/admin/Groups';
import PRDs from './pages/admin/PRDs';
import PRDEditor from './pages/admin/PRDEditor';
import SiteSettings from './pages/admin/SiteSettings';
import Analytics from './pages/admin/Analytics';

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/p/:slug" element={<PresentationView />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/presentations"
            element={
              <ProtectedRoute adminOnly>
                <Presentations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute adminOnly>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/groups"
            element={
              <ProtectedRoute adminOnly>
                <Groups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/prds"
            element={
              <ProtectedRoute adminOnly>
                <PRDs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/prds/new"
            element={
              <ProtectedRoute adminOnly>
                <PRDEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/prds/:id"
            element={
              <ProtectedRoute adminOnly>
                <PRDEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute adminOnly>
                <SiteSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute adminOnly>
                <Analytics />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}
