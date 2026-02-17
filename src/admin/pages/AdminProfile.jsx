import React, { useEffect, useMemo, useState } from "react";
import { Card, Button, Form, Alert, Row, Col } from "react-bootstrap";
import api, { getErrMsg } from "../../services/api";

const initial = {
  slug: "",
  display_name: "",
  headline: "",
  about_md: "",
  email_public: "",
  phone_public: "",
  location: "",
  avatar_media_id: null,
  resume_media_id: null,
  is_published: false,
};

const mediaUrl = (id) => (id ? `/api/media/${id}` : "");

export default function AdminProfile() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const avatarPreview = useMemo(() => mediaUrl(form.avatar_media_id), [form.avatar_media_id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/me/profile");
        if (mounted && res.data) setForm((p) => ({ ...p, ...res.data }));
      } catch (err) {
        if (mounted) setErrorMsg(getErrMsg(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const uploadMedia = async (file, alt_text) => {
    const fd = new FormData();
    fd.append("file", file);
    if (alt_text) fd.append("alt_text", alt_text);

    const res = await api.post("/media", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data; // { id }
  };

  const onUploadAvatar = async (file) => {
    const r = await uploadMedia(file, "avatar");
    setForm((p) => ({ ...p, avatar_media_id: r.id }));
  };

  const onUploadResume = async (file) => {
    const r = await uploadMedia(file, "resume");
    setForm((p) => ({ ...p, resume_media_id: r.id }));
  };

  const onSave = async () => {
    try {
      setErrorMsg("");
      setSaving(true);

      const payload = {
        ...form,
        avatar_media_id: form.avatar_media_id || null,
        resume_media_id: form.resume_media_id || null,
        is_published: !!form.is_published,
      };

      const res = await api.post("/me/profile", payload);
      setForm((p) => ({ ...p, ...res.data }));
      alert("บันทึกแล้ว");
    } catch (err) {
      setErrorMsg(getErrMsg(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>กำลังโหลด...</div>;

  return (
    <div style={{ maxWidth: 1000 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">โปรไฟล์</h4>
        <Button onClick={onSave} disabled={saving}>
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </div>

      {errorMsg ? <Alert variant="danger" className="py-2">{errorMsg}</Alert> : null}

      <Card>
        <Card.Body className="d-grid gap-3">
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Slug</Form.Label>
              <Form.Control
                value={form.slug || ""}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              />
            </Col>

            <Col md={6}>
              <Form.Label>ชื่อแสดง</Form.Label>
              <Form.Control
                value={form.display_name || ""}
                onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
              />
            </Col>

            <Col md={12}>
              <Form.Label>Headline</Form.Label>
              <Form.Control
                value={form.headline || ""}
                onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))}
              />
            </Col>

            <Col md={12}>
              <Form.Label>About (Markdown)</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={form.about_md || ""}
                onChange={(e) => setForm((p) => ({ ...p, about_md: e.target.value }))}
              />
            </Col>

            <Col md={4}>
              <Form.Label>Email (public)</Form.Label>
              <Form.Control
                value={form.email_public || ""}
                onChange={(e) => setForm((p) => ({ ...p, email_public: e.target.value }))}
              />
            </Col>

            <Col md={4}>
              <Form.Label>Phone (public)</Form.Label>
              <Form.Control
                value={form.phone_public || ""}
                onChange={(e) => setForm((p) => ({ ...p, phone_public: e.target.value }))}
              />
            </Col>

            <Col md={4}>
              <Form.Label>Location</Form.Label>
              <Form.Control
                value={form.location || ""}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              />
            </Col>

            <Col md={6}>
              <Form.Label>Avatar</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && onUploadAvatar(e.target.files[0])}
              />
              {avatarPreview ? (
                <div className="mt-2">
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 12 }}
                  />
                </div>
              ) : null}
            </Col>

            <Col md={6}>
              <Form.Label>Resume (PDF)</Form.Label>
              <Form.Control
                type="file"
                accept="application/pdf"
                onChange={(e) => e.target.files?.[0] && onUploadResume(e.target.files[0])}
              />
              {form.resume_media_id ? (
                <div className="mt-2">
                  <a
                    className="btn btn-outline-secondary"
                    href={mediaUrl(form.resume_media_id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    เปิดไฟล์ Resume
                  </a>
                </div>
              ) : null}
            </Col>

            <Col md={12}>
              <Form.Check
                type="checkbox"
                label="เผยแพร่โปรไฟล์"
                checked={!!form.is_published}
                onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.checked }))}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}
