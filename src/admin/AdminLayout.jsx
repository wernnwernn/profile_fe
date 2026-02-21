import React, { useEffect } from "react";
import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearToken } from "../services/tokenStorage";
import "./admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", "dark");
    document.body.style.backgroundColor = "#101214";
    document.body.style.color = "#d1d5db";
    return () => {
      document.documentElement.setAttribute("data-bs-theme", "light");
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, []);

  const logout = () => {
    clearToken();
    navigate("/admin/login");
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* sidebar */}
      <div className="border-end p-3" style={{ width: 260 }}>
        <div className="fw-bold mb-3">Profile CMS</div>

        <Nav className="flex-column gap-2">
          <Nav.Link as={NavLink} to="/admin/profile" className="btn btn-outline-secondary text-start">
            Profile
          </Nav.Link>
          <Nav.Link as={NavLink} to="/admin/links" className="btn btn-outline-secondary text-start">
            Links
          </Nav.Link>
          <Nav.Link as={NavLink} to="/admin/skills" className="btn btn-outline-secondary text-start">
            Skills
          </Nav.Link>
          <Nav.Link as={NavLink} to="/admin/experiences" className="btn btn-outline-secondary text-start">
            Experiences
          </Nav.Link>
          <Nav.Link as={NavLink} to="/admin/educations" className="btn btn-outline-secondary text-start">
            Educations
          </Nav.Link>
          <Nav.Link as={NavLink} to="/admin/certificates" className="btn btn-outline-secondary text-start">
            Certificates
          </Nav.Link>
          {/* ปิดการใช้งาน */}
          {/* <Nav.Link as={NavLink} to="/admin/tags" className="btn btn-outline-secondary text-start">
            Tags
          </Nav.Link> */}
          <Nav.Link as={NavLink} to="/admin/projects" className="btn btn-outline-secondary text-start">
            Projects
          </Nav.Link>
          <Nav.Link as={NavLink} to="/admin/media" className="btn btn-outline-secondary text-start">
            Media
          </Nav.Link>
          <Nav.Link as={NavLink} to="/admin/users" className="btn btn-outline-secondary text-start">
            Users
          </Nav.Link>
        </Nav>

        <Button variant="outline-info" className="w-100 mt-3" onClick={() => navigate(`/${localStorage.getItem("profile_slug")}`)}>
          Your Profile
        </Button>
        <Button variant="outline-danger" className="w-100 mt-3" onClick={logout}>
          Log Out
        </Button>
      </div>

      {/* content */}
      <div className="flex-grow-1">
        <Navbar className="border-bottom">
          <Container fluid className="px-4">
            <Navbar.Brand className="fw-semibold">Admin</Navbar.Brand>
          </Container>
        </Navbar>

        <Container fluid className="p-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
}
