import React, { useMemo, useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { register } from "../services/publicApi";
import { useNotify } from "../ui/NotificationProvider";

export default function PublicAuthRegister() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    passwordConfirm: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const notify = useNotify();
  const navigate = useNavigate();

  const usernameTrimmed = useMemo(
    () => String(form.username || "").trim(),
    [form.username]
  );

  const submit = async (e) => {
    e.preventDefault();

    if (!usernameTrimmed) return notify.error("กรุณากรอก Username");
    if (!form.password) return notify.error("กรุณากรอกรหัสผ่าน");
    if (form.password !== form.passwordConfirm) {
      return notify.error("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
    }

    try {
      setSubmitting(true);
      await register({ username: usernameTrimmed, password: form.password });
      notify.success("สมัครใช้งานสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      notify.error(err?.message || "สมัครใช้งานไม่สำเร็จ");
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
          <h4 className="mb-1">สมัครใช้งาน CMS</h4>
          <p className="text-secondary small mb-3">
            สร้างบัญชีเพื่อจัดการ Public Profile ของคุณเอง
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
                autoComplete="new-password"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="small">ยืนยันรหัสผ่าน</Form.Label>
              <Form.Control
                type="password"
                value={form.passwordConfirm}
                onChange={(e) =>
                  setForm((p) => ({ ...p, passwordConfirm: e.target.value }))
                }
                autoComplete="new-password"
              />
            </Form.Group>

            <Button type="submit" disabled={submitting} className="mt-2">
              {submitting ? "กำลังสมัครใช้งาน..." : "สมัครใช้งาน"}
            </Button>

            <div className="text-center small text-secondary mt-2">
              มีแอคเคานต์อยู่แล้ว?{" "}
              <Button
                variant="link"
                className="p-0 align-baseline"
                onClick={() => navigate("/login")}
              >
                เข้าสู่ระบบ
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
