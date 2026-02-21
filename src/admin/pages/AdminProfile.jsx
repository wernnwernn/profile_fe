import React, { useEffect, useMemo, useState } from "react";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import api, { getErrMsg } from "../../services/api";
import { useNotify } from "../../ui/NotificationProvider";
import MediaPickerModal from "../components/MediaPickerModal";
import { mediaUrl } from "../../services/cms/mediaApi";

const initial = {
  slug: "",
  display_name: "",
  headline: "",
  about_md: "",
  github_public: "",
  email_public: "",
  phone_public: "",
  location: "",
  avatar_media_id: null,
  resume_media_id: null,
  is_published: false,
  show_content: {
    about: true,
    experience: true,
    projects: true,
    skills: true,
    education: true,
    certificates: true,
    contact: true,
    hero: true
  }
};


export default function AdminProfile() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null); // 'avatar' | 'resume'
  const { success, error } = useNotify();

  const avatarPreview = useMemo(() => form.avatar_media_id ? mediaUrl(form.avatar_media_id) : null, [form.avatar_media_id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/me/profile");
        if (mounted && res.data) {
          const data = res.data;
          let parsedShowContent = initial.show_content;
          if (data.show_content) {
            try {
              parsedShowContent = typeof data.show_content === 'string' ? JSON.parse(data.show_content) : data.show_content;
              parsedShowContent = { ...initial.show_content, ...parsedShowContent };
            } catch (e) {
              console.error("Failed to parse show_content", e);
            }
          }
          setForm((p) => ({ ...p, ...data, show_content: parsedShowContent }));
        }
      } catch (err) {
        if (mounted) error(getErrMsg(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [error]);

  const onSelectMedia = (mediaId) => {
    if (pickerTarget === "avatar") {
      setForm((p) => ({ ...p, avatar_media_id: mediaId }));
    } else if (pickerTarget === "resume") {
      setForm((p) => ({ ...p, resume_media_id: mediaId }));
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);

      const payload = {
        ...form,
        avatar_media_id: form.avatar_media_id || null,
        resume_media_id: form.resume_media_id || null,
        is_published: !!form.is_published,
      };

      const res = await api.post("/me/profile", payload);
      setForm((p) => ({ ...p, ...res.data }));
      success("บันทึกโปรไฟล์แล้ว");
    } catch (err) {
      error(getErrMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const handleShowContentChange = (key, checked) => {
    setForm((p) => ({
      ...p,
      show_content: { ...p.show_content, [key]: checked }
    }));
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

      <Card>
        <Card.Body className="d-grid gap-3">
          <Row className="g-3">
            {/* Slug input removed as it is auto-generated from username */}

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

            <Col md={12}>
              <Form.Label>GitHub (public URL)</Form.Label>
              <Form.Control
                value={form.github_public || ""}
                onChange={(e) => setForm((p) => ({ ...p, github_public: e.target.value }))}
                placeholder="https://github.com/username"
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
              <div>
                <Button variant="outline-primary" onClick={() => setPickerTarget("avatar")}>เลือก Media</Button>
                {form.avatar_media_id && (
                  <Button variant="outline-danger" className="ms-2" onClick={() => setForm((p) => ({ ...p, avatar_media_id: null }))}>ยกเลิก Avatar</Button>
                )}
              </div>
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
              <div>
                <Button variant="outline-primary" onClick={() => setPickerTarget("resume")}>เลือก Media</Button>
                {form.resume_media_id && (
                  <Button variant="outline-danger" className="ms-2" onClick={() => setForm((p) => ({ ...p, resume_media_id: null }))}>ยกเลิก Resume</Button>
                )}
              </div>
              {form.resume_media_id ? (
                <div className="mt-2">
                  <a
                    className="btn btn-outline-secondary btn-sm border-light"
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
                label="เผยแพร่โปรไฟล์ (ตั้งค่าเป็น Public)"
                checked={!!form.is_published}
                onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.checked }))}
                className="mb-4"
              />

              <h5 className="mb-3">การแสดงผลบนหน้า Public (Show Content)</h5>
              <div className="d-flex flex-wrap gap-4 p-3 border rounded bg-body-tertiary">
                {[
                  { key: "hero", label: "Hero" },
                  { key: "about", label: "About" },
                  { key: "experience", label: "Experience" },
                  { key: "projects", label: "Projects" },
                  { key: "skills", label: "Skills" },
                  { key: "education", label: "Education" },
                  { key: "certificates", label: "Certificates" },
                  { key: "contact", label: "Contact (Footer)" },
                ].map((item) => (
                  <Form.Check
                    type="switch"
                    id={`switch-${item.key}`}
                    key={item.key}
                    label={item.label}
                    checked={!!form.show_content?.[item.key]}
                    onChange={(e) => handleShowContentChange(item.key, e.target.checked)}
                  />
                ))}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <MediaPickerModal
        show={!!pickerTarget}
        onHide={() => setPickerTarget(null)}
        onSelect={onSelectMedia}
      />
    </div>
  );
}