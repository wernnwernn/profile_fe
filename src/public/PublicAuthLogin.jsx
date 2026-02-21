import React, { useMemo, useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { publicLogin } from "../services/publicApi";
import { setToken } from "../services/tokenStorage";
import { useNotify } from "../ui/NotificationProvider";

export default function PublicAuthLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const notify = useNotify();
  const navigate = useNavigate();
  const location = useLocation();

  const usernameTrimmed = useMemo(
    () => String(form.username || "").trim(),
    [form.username]
  );

  const from = (location.state && location.state.from) || "/admin/profile";

  const submit = async (e) => {
    e.preventDefault();

    if (!usernameTrimmed) return notify.error("กรุณากรอก Username");
    if (!form.password) return notify.error("กรุณากรอกรหัสผ่าน");

    try {
      setSubmitting(true);
      const res = await publicLogin({
        username: usernameTrimmed,
        password: form.password,
      });
      if (!res?.token) {
        throw new Error("ไม่พบ token จากเซิร์ฟเวอร์");
      }
      setToken(res.token);
      navigate(from, { replace: true });
    } catch (err) {
      notify.error(err?.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "60vh" }}
    >
      <Card
        className="shadow-lg"
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: "1.4rem",
          border: "1px solid rgba(148,163,184,0.4)",
          background:
            "radial-gradient(circle at top left, rgba(148,163,184,0.18), transparent 55%), rgba(15,23,42,0.97)",
          color: "#f8f9fa",
        }}
      >
        <Card.Body>
          <h4 className="mb-1">เข้าสู่ระบบ CMS</h4>
          <p className="text-secondary small mb-3">
            ใช้สำหรับจัดการข้อมูลโปรไฟล์, skills, projects และอื่น ๆ
          </p>

          <Form onSubmit={submit} className="d-grid gap-2">
            <Form.Group>
              <Form.Label className="small">Username</Form.Label>
              <Form.Control
                type="text"
                value={form.username}
                onChange={(e) =>
                  setForm((p) => ({ ...p, username: e.target.value }))
                }
                autoComplete="username"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="small">Password</Form.Label>
              <Form.Control
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                autoComplete="current-password"
              />
            </Form.Group>

            <Button type="submit" disabled={submitting} className="mt-2">
              {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>

            <div className="text-center small text-secondary mt-2">
              ยังไม่มีแอคเคานต์?{" "}
              <Button
                variant="link"
                className="p-0 align-baseline"
                onClick={() => navigate("/register")}
              >
                สมัครใช้งาน
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

