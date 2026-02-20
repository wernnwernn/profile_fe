import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Form, Row, Spinner, Stack } from "react-bootstrap";
import { getErrMsg } from "../../services/api";
import { listTags, createTag, updateTag, deleteTag } from "../../services/cms/tagsApi";
import { useNotify } from "../../ui/NotificationProvider";

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
  const notify = useNotify();

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")) || (a.id ?? 0) - (b.id ?? 0));
  }, [items]);

  const fetchData = useMemo(() => async () => {
    setLoading(true);
    try {
      setItems(await listTags());
    } catch (e) {
      notify.error(getErrMsg(e) || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onChange = (id, patch) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const addNew = () => {
    const tempId = `temp-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        id: tempId,
        name: "",
        slug: "",
        _isNew: true,
      },
    ]);
  };

  const saveRow = async (row) => {
    setSaving(true);
    try {
      const name = String(row.name || "").trim();
      if (!name) throw new Error("กรุณากรอก name");
      const slug = String(row.slug || "").trim() || slugify(name);

      if (row._isNew) {
        const created = await createTag({ name, slug });
        setItems((prev) => prev.map((x) => (x.id === row.id ? created : x)));
        notify.success("เพิ่มแล้ว");
      } else {
        const updated = await updateTag(row.id, { name, slug });
        setItems((prev) => prev.map((x) => (x.id === row.id ? updated : x)));
        notify.success("บันทึกแล้ว");
      }
    } catch (e) {
      notify.error(getErrMsg(e) || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const removeRow = async (id) => {
    const row = items.find((x) => x.id === id);
    if (!row) return;

    if (row._isNew) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      return;
    }
    if (!window.confirm("ลบ tag นี้?")) return;
    setSaving(true);
    try {
      await deleteTag(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      notify.success("ลบแล้ว");
    } catch (e) {
      notify.error(getErrMsg(e) || "ลบไม่สำเร็จ");
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
