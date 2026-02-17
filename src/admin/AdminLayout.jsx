import React, { useContext } from "react";
import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ThemeContext } from "../theme/ThemeProvider";
import { clearToken } from "../services/tokenStorage";

export default function AdminLayout() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

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
            โปรไฟล์
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
          <Nav.Link as={NavLink} to="/admin/tags" className="btn btn-outline-secondary text-start">
            Tags
          </Nav.Link>
          <Nav.Link as={NavLink} to="/admin/projects" className="btn btn-outline-secondary text-start">
            Projects
          </Nav.Link>
          <Nav.Link as={NavLink} to="/admin/media" className="btn btn-outline-secondary text-start">
            Media
          </Nav.Link>
        </Nav>

        <hr />

        <Button variant="outline-primary" className="w-100 mb-2" onClick={toggleTheme}>
          โหมด: {theme === "dark" ? "มืด" : "สว่าง"}
        </Button>

        <Button variant="outline-danger" className="w-100" onClick={logout}>
          ออกจากระบบ
        </Button>
      </div>

      {/* content */}
      <div className="flex-grow-1">
        <Navbar className="border-bottom">
          <Container fluid className="px-4">
            <Navbar.Brand className="fw-semibold">Admin</Navbar.Brand>
            <div className="text-secondary" style={{ fontSize: 13 }}>
              Theme: {theme}
            </div>
          </Container>
        </Navbar>

        <Container fluid className="p-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
}
