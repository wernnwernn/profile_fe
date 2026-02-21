import React, { useMemo, useState } from "react";
import { Card, Button, Form, Alert, Spinner, InputGroup, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api, { getErrMsg } from "../../services/api";
import { setToken } from "../../services/tokenStorage";
import "../../public/lofi.css";

export default function AdminLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState("");
  const navigate = useNavigate();

  const usernameTrimmed = useMemo(() => String(form.username || "").trim(), [form.username]);

  const DEMO = useMemo(
    () => ({
      username: "demo_user1",
      password: "A12345",
      note: "For demo only (limited access).",
    }),
    []
  );

  const copyText = async (key, value) => {
    try {
      await navigator.clipboard.writeText(String(value ?? ""));
      setCopied(key);
      setTimeout(() => setCopied(""), 1200);
    } catch {
    }
  };

  const fillDemo = () => {
    setForm({ username: DEMO.username, password: DEMO.password });
    setErrorMsg("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!usernameTrimmed) return setErrorMsg("กรุณากรอก Username");
    if (!form.password) return setErrorMsg("กรุณากรอกรหัสผ่าน");

    try {
      setSubmitting(true);
      const res = await api.post("/auth/login", { username: usernameTrimmed, password: form.password });
      setToken(res.data.token);
      localStorage.setItem("profile_slug", usernameTrimmed);
      navigate("/admin/profile", { replace: true });
    } catch (err) {
      setErrorMsg(getErrMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="lofi-bg" style={{ minHeight: "100vh" }}>
      <div className="container" style={{ maxWidth: 480, paddingTop: 90, paddingBottom: 40 }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <Card
            className="lofi-box mb-3"
            style={{
              borderRadius: 18,
              border: "1px solid rgba(93,84,82,0.18)",
            }}
          >
            <Card.Body className="p-3">
              <div className="d-flex align-items-start justify-content-between gap-2">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="fw-bold" style={{ color: "#332E2C" }}>
                      Demo Account
                    </div>
                    <Badge
                      bg="light"
                      text="dark"
                      style={{
                        background: "rgba(223,137,118,0.18)",
                        border: "1px solid rgba(223,137,118,0.28)",
                      }}
                    >
                      Public
                    </Badge>
                  </div>
                  <div className="small text-secondary" style={{ color: "#8E8886" }}>
                    {DEMO.note}
                  </div>
                </div>

                <Button
                  size="sm"
                    variant="outline-secondary"
                    onClick={fillDemo}
                    style={{ borderRadius: 12, borderColor: "rgba(93,84,82,0.22)" }}
                  >
                    Use Demo
                  </Button>
                </div>

                <div className="mt-3 d-grid gap-2">
                  <div
                    className="d-flex align-items-center justify-content-between"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: "1px solid rgba(93,84,82,0.18)",
                      background: "rgba(255,255,255,0.55)",
                    }}
                  >
                    <div className="small">
                      <span className="text-muted">Username:</span>{" "}
                      <span className="fw-semibold">{DEMO.username}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => copyText("username", DEMO.username)}
                      style={{ borderRadius: 12, borderColor: "rgba(93,84,82,0.22)" }}
                    >
                      {copied === "username" ? "Copied" : "Copy"}
                    </Button>
                  </div>

                  <div
                    className="d-flex align-items-center justify-content-between"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: "1px solid rgba(93,84,82,0.18)",
                      background: "rgba(255,255,255,0.55)",
                    }}
                  >
                    <div className="small">
                      <span className="text-muted">Password:</span>{" "}
                      <span className="fw-semibold">{DEMO.password}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => copyText("password", DEMO.password)}
                      style={{ borderRadius: 12, borderColor: "rgba(93,84,82,0.22)" }}
                    >
                      {copied === "password" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="lofi-box">
              <Card.Body className="p-4 p-md-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <div className="lofi-heading" style={{ fontSize: 22 }}>
                      Admin Console
                    </div>
                    <div className="text-secondary small" style={{ color: "#8E8886" }}>
                      Sign in to manage your profile content.
                    </div>
                  </div>

                  <span
                    className="lofi-pill"
                    style={{
                      background: "rgba(223,137,118,0.16)",
                      color: "#B85C47",
                      border: "1px solid rgba(223,137,118,0.25)",
                      padding: "6px 10px",
                      borderRadius: 999,
                      fontWeight: 700,
                    }}
                  >
                    Owner Only
                  </span>
                </div>

                {errorMsg ? (
                  <Alert variant="danger" className="py-2 mb-3" style={{ borderRadius: 14 }}>
                    {errorMsg}
                  </Alert>
                ) : null}

                <Form onSubmit={submit} className="d-grid gap-2">
                  <Form.Label className="small text-muted mb-1">Username</Form.Label>
                  <Form.Control
                    placeholder="Enter username"
                    value={form.username}
                    onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                    autoComplete="username"
                    style={{ borderRadius: 14, padding: "10px 12px" }}
                  />

                  <div className="mt-2" />

                  <Form.Label className="small text-muted mb-1">Password</Form.Label>

                  <InputGroup>
                    <Form.Control
                      placeholder="Enter password"
                      type={showPw ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      autoComplete="current-password"
                      style={{
                        padding: "10px 12px",
                        borderTopLeftRadius: 14,
                        borderBottomLeftRadius: 14,
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        borderColor: "rgba(93,84,82,0.22)",
                        boxShadow: "none",
                      }}
                    />

                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => setShowPw((v) => !v)}
                      style={{
                        minWidth: 52,
                        borderTopRightRadius: 14,
                        borderBottomRightRadius: 14,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderColor: "rgba(93,84,82,0.22)",
                        boxShadow: "none",
                      }}
                      title={showPw ? "Hide password" : "Show password"}
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? "🙈" : "👁️"}
                    </Button>
                  </InputGroup>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="mt-3"
                    style={{
                      borderRadius: 14,
                      padding: "10px 12px",
                      fontWeight: 800,
                      border: "1px solid rgba(93,84,82,0.22)",
                      background: "#DF8976",
                      color: "#1F1B1A",
                    }}
                  >
                    {submitting ? (
                      <span className="d-inline-flex align-items-center gap-2">
                        <Spinner size="sm" animation="border" />
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <div className="text-secondary small mt-2" style={{ color: "#8E8886" }}>
                    This page is for administrative access only.
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </motion.div>
        </div>
      </div>
  );
}