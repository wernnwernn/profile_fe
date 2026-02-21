import React, { useMemo, useState } from "react";
import { Card, Button, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api, { getErrMsg } from "../../services/api";
import { setToken } from "../../services/tokenStorage";

export default function AdminLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const usernameTrimmed = useMemo(() => String(form.username || "").trim(), [form.username]);

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!usernameTrimmed) return setErrorMsg("กรุณากรอก Username");
    if (!form.password) return setErrorMsg("กรุณากรอกรหัสผ่าน");

    try {
      setSubmitting(true);
      const res = await api.post("/auth/login", { username: usernameTrimmed, password: form.password });
      setToken(res.data.token);
      navigate("/admin/profile", { replace: true });
    } catch (err) {
      setErrorMsg(getErrMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: 80 }}>
      <Card className="shadow-sm">
        <Card.Body>
          <h5 className="mb-3">Admin Login</h5>

          {errorMsg ? <Alert variant="danger" className="py-2">{errorMsg}</Alert> : null}

          <Form onSubmit={submit} className="d-grid gap-2">
            <Form.Control
              placeholder="username"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
            />
            <Form.Control
              placeholder="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />

            <Button type="submit" disabled={submitting}>
              {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
