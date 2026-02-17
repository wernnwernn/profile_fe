import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner, Stack } from "react-bootstrap";
import { getErrMsg } from "../../services/api";
import { listTags, createTag, updateTag, deleteTag } from "../../services/cms/tagsApi";

const slugify = (v) =>
  String(v || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default function AdminTags() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [alert, setAlert] = useState(null);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")) || (a.id ?? 0) - (b.id ?? 0));
  }, [items]);

  const fetchData = async () => {
    setLoading(true);
    try {
      setItems(await listTags());
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "โหลดข้อมูลไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onChange = (id, patch) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const addNew = async () => {
    setSaving(true);
    try {
      const row = await createTag({ name: "", slug: "" });
      setItems((prev) => [...prev, row]);
      setAlert({ variant: "success", message: "เพิ่มแล้ว" });
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "เพิ่มไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const saveRow = async (row) => {
    setSaving(true);
    try {
      const name = String(row.name || "").trim();
      if (!name) throw new Error("กรุณากรอก name");
      const slug = String(row.slug || "").trim() || slugify(name);

      const updated = await updateTag(row.id, { name, slug });
      setItems((prev) => prev.map((x) => (x.id === row.id ? updated : x)));
      setAlert({ variant: "success", message: "บันทึกแล้ว" });
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "บันทึกไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const removeRow = async (id) => {
    if (!window.confirm("ลบ tag นี้?") ) return;
    setSaving(true);
    try {
      await deleteTag(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setAlert({ variant: "success", message: "ลบแล้ว" });
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "ลบไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-3">
      <Stack direction="horizontal" className="mb-3" gap={2}>
        <h4 className="m-0">Tags</h4>
        <div className="ms-auto" />
        <Button variant="primary" onClick={addNew} disabled={saving}>
          {saving ? <Spinner size="sm" /> : "Add"}
        </Button>
      </Stack>

      {alert ? (
        <Alert variant={alert.variant} onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      ) : null}

      {loading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : (
        <Row xs={1} md={2} className="g-3">
          {sorted.map((row) => (
            <Col key={row.id}>
              <Card>
                <Card.Body>
                  <Row className="g-2">
                    <Col md={12}>
                      <Form.Label className="small">name</Form.Label>
                      <Form.Control value={row.name || ""} onChange={(e) => onChange(row.id, { name: e.target.value })} />
                    </Col>
                    <Col md={12}>
                      <Form.Label className="small">slug</Form.Label>
                      <Form.Control
                        value={row.slug || ""}
                        onChange={(e) => onChange(row.id, { slug: e.target.value })}
                        placeholder="ปล่อยว่างเพื่อให้ระบบสร้างให้อัตโนมัติ"
                      />
                      <div className="text-secondary small mt-1">แนะนำ: {slugify(row.name || "")}</div>
                    </Col>
                  </Row>

                  <Stack direction="horizontal" gap={2} className="mt-3">
                    <Button size="sm" variant="success" onClick={() => saveRow(row)} disabled={saving}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => removeRow(row.id)} disabled={saving}>
                      Delete
                    </Button>
                  </Stack>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
