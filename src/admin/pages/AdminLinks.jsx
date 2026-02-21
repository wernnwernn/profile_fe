import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner, Stack } from "react-bootstrap";
import { getErrMsg } from "../../services/api";
import {
  listProfileLinks,
  createProfileLink,
  updateProfileLink,
  deleteProfileLink,
  reorderProfileLinks,
} from "../../services/cms/profileLinksApi";

const normalizeUrl = (v) => String(v || "").trim();

export default function AdminLinks() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [alert, setAlert] = useState(null);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.id ?? 0) - (b.id ?? 0));
  }, [items]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const rows = await listProfileLinks();
      setItems(rows);
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

  const addNew = () => {
    const tempId = `temp-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        id: tempId,
        platform: "website",
        label: "",
        url: "",
        is_active: true,
        _isNew: true,
      },
    ]);
  };

  const saveRow = async (row) => {
    setSaving(true);
    try {
      if (!row.platform) throw new Error("กรุณากรอก platform");
      if (!normalizeUrl(row.url)) throw new Error("กรุณากรอก url");
      const payload = {
        platform: row.platform,
        label: row.label,
        url: row.url,
        sort_order: row.sort_order,
        is_active: !!row.is_active,
      };
      if (row._isNew) {
        const created = await createProfileLink(payload);
        setItems((prev) => prev.map((x) => (x.id === row.id ? created : x)));
        setAlert({ variant: "success", message: "เพิ่มลิงก์แล้ว" });
      } else {
        const updated = await updateProfileLink(row.id, payload);
        setItems((prev) => prev.map((x) => (x.id === row.id ? updated : x)));
        setAlert({ variant: "success", message: "บันทึกแล้ว" });
      }
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "บันทึกไม่สำเร็จ" });
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

    if (!window.confirm("ลบรายการนี้?") ) return;
    setSaving(true);
    try {
      await deleteProfileLink(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setAlert({ variant: "success", message: "ลบแล้ว" });
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "ลบไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const move = async (id, dir) => {
    const arr = [...sorted];
    const idx = arr.findIndex((x) => x.id === id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= arr.length) return;
    if (arr[idx]._isNew || arr[next]._isNew) return;
    const tmp = arr[idx];
    arr[idx] = arr[next];
    arr[next] = tmp;

    // optimistic
    const orderedIds = arr.map((x) => x.id);
    setItems(arr.map((x, i) => ({ ...x, sort_order: i })));

    try {
      await reorderProfileLinks(orderedIds);
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "จัดลำดับไม่สำเร็จ" });
      fetchData();
    }
  };

  return (
    <div className="py-3">
      <Stack direction="horizontal" className="mb-3" gap={2}>
        <h4 className="m-0">Links</h4>
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
          {sorted.map((row, i) => (
            <Col key={row.id}>
              <Card>
                <Card.Body>
                  <Stack direction="horizontal" gap={2} className="mb-2">
                    <div className="fw-semibold">#{i + 1}</div>
                    <div className="ms-auto" />
                    <Button size="sm" variant="outline-secondary" onClick={() => move(row.id, -1)} disabled={saving || i === 0}>
                      ↑
                    </Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => move(row.id, +1)} disabled={saving || i === sorted.length - 1}>
                      ↓
                    </Button>
                  </Stack>

                  <Row className="g-2">
                    <Col md={4}>
                      <Form.Label className="small">platform</Form.Label>
                      <Form.Control
                        value={row.platform || ""}
                        onChange={(e) => onChange(row.id, { platform: e.target.value })}
                      />
                    </Col>
                    <Col md={8}>
                      <Form.Label className="small">label</Form.Label>
                      <Form.Control
                        value={row.label || ""}
                        onChange={(e) => onChange(row.id, { label: e.target.value })}
                      />
                    </Col>
                    <Col md={12}>
                      <Form.Label className="small">url</Form.Label>
                      <Form.Control
                        value={row.url || ""}
                        onChange={(e) => onChange(row.id, { url: e.target.value })}
                      />
                    </Col>
                    <Col md={12}>
                      <Form.Check
                        type="switch"
                        id={`active-${row.id}`}
                        label="active"
                        checked={!!row.is_active}
                        onChange={(e) => onChange(row.id, { is_active: e.target.checked })}
                      />
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
