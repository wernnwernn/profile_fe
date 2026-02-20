import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner, Stack } from "react-bootstrap";
import { getErrMsg } from "../../services/api";
import {
  listCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  reorderCertificates,
} from "../../services/cms/certificatesApi";

export default function AdminCertificates() {
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
      setItems(await listCertificates());
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
        name: "",
        issuer: "",
        issue_date: null,
        credential_url: "",
        media_id: null,
        _isNew: true,
      },
    ]);
  };

  const saveRow = async (row) => {
    setSaving(true);
    try {
      if (!String(row.name || "").trim()) throw new Error("กรุณากรอก name");
      const payload = {
        name: row.name,
        issuer: row.issuer,
        issue_date: row.issue_date || null,
        credential_url: row.credential_url,
        media_id: row.media_id === "" || row.media_id === null || row.media_id === undefined ? null : Number(row.media_id),
      };
      if (row._isNew) {
        const created = await createCertificate(payload);
        setItems((prev) => prev.map((x) => (x.id === row.id ? created : x)));
        setAlert({ variant: "success", message: "เพิ่มแล้ว" });
      } else {
        const updated = await updateCertificate(row.id, payload);
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
      await deleteCertificate(id);
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

    const orderedIds = arr.map((x) => x.id);
    setItems(arr.map((x, i) => ({ ...x, sort_order: i })));

    try {
      await reorderCertificates(orderedIds);
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "จัดลำดับไม่สำเร็จ" });
      fetchData();
    }
  };

  return (
    <div className="py-3">
      <Stack direction="horizontal" className="mb-3" gap={2}>
        <h4 className="m-0">Certificates</h4>
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
        <Row xs={1} className="g-3">
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
                    <Col md={6}>
                      <Form.Label className="small">name</Form.Label>
                      <Form.Control value={row.name || ""} onChange={(e) => onChange(row.id, { name: e.target.value })} />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small">issuer</Form.Label>
                      <Form.Control value={row.issuer || ""} onChange={(e) => onChange(row.id, { issuer: e.target.value })} />
                    </Col>
                    <Col md={3}>
                      <Form.Label className="small">issue_date</Form.Label>
                      <Form.Control type="date" value={row.issue_date ? String(row.issue_date).slice(0, 10) : ""} onChange={(e) => onChange(row.id, { issue_date: e.target.value || null })} />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small">credential_url</Form.Label>
                      <Form.Control value={row.credential_url || ""} onChange={(e) => onChange(row.id, { credential_url: e.target.value })} />
                    </Col>
                    <Col md={3}>
                      <Form.Label className="small">media_id</Form.Label>
                      <Form.Control value={row.media_id ?? ""} onChange={(e) => onChange(row.id, { media_id: e.target.value })} />
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
