import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import RequireAdminAuth from "../admin/RequireAdminAuth";
import AdminLayout from "../admin/AdminLayout";
import AdminLogin from "../admin/pages/AdminLogin";
import AdminProfile from "../admin/pages/AdminProfile";
import AdminLinks from "../admin/pages/AdminLinks";
import AdminSkills from "../admin/pages/AdminSkills";
import AdminExperiences from "../admin/pages/AdminExperiences";
import AdminEducations from "../admin/pages/AdminEducations";
import AdminCertificates from "../admin/pages/AdminCertificates";
import AdminTags from "../admin/pages/AdminTags";
import AdminProjects from "../admin/pages/AdminProjects";
import AdminMedia from "../admin/pages/AdminMedia";
import AdminUsers from "../admin/pages/AdminUsers";

import PublicProfilePage from "../public/PublicProfilePage";

export default function RootRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<PublicProfilePage isOwner />} />
        <Route path="/:id" element={<PublicProfilePage />} />

        {/* admin area */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin"
          element={
            <RequireAdminAuth>
              <AdminLayout />
            </RequireAdminAuth>
          }
        >
          <Route index element={<Navigate to="/admin/profile" replace />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="links" element={<AdminLinks />} />
          <Route path="skills" element={<AdminSkills />} />
          <Route path="experiences" element={<AdminExperiences />} />
          <Route path="educations" element={<AdminEducations />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="tags" element={<AdminTags />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

