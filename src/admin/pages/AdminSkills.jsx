import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner, Stack } from "react-bootstrap";
import { getErrMsg } from "../../services/api";
import { listSkills, createSkill, updateSkill, deleteSkill, reorderSkills } from "../../services/cms/skillsApi";

export default function AdminSkills() {
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
      setItems(await listSkills());
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
      const row = await createSkill({ name: "", category: "", level: null, is_active: true });
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
      if (!String(row.name || "").trim()) throw new Error("กรุณากรอก name");
      const payload = {
        name: row.name,
        category: row.category,
        level: row.level === "" || row.level === null || row.level === undefined ? null : Number(row.level),
        is_active: !!row.is_active,
      };
      const updated = await updateSkill(row.id, payload);
      setItems((prev) => prev.map((x) => (x.id === row.id ? updated : x)));
      setAlert({ variant: "success", message: "บันทึกแล้ว" });
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "บันทึกไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const removeRow = async (id) => {
    if (!window.confirm("ลบรายการนี้?") ) return;
    setSaving(true);
    try {
      await deleteSkill(id);
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
    const tmp = arr[idx];
    arr[idx] = arr[next];
    arr[next] = tmp;

    const orderedIds = arr.map((x) => x.id);
    setItems(arr.map((x, i) => ({ ...x, sort_order: i })));

    try {
      await reorderSkills(orderedIds);
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "จัดลำดับไม่สำเร็จ" });
      fetchData();
    }
  };

  return (
    <div className="py-3">
      <Stack direction="horizontal" className="mb-3" gap={2}>
        <h4 className="m-0">Skills</h4>
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
                    <Col md={12}>
                      <Form.Label className="small">name</Form.Label>
                      <Form.Control value={row.name || ""} onChange={(e) => onChange(row.id, { name: e.target.value })} />
                    </Col>
                    <Col md={8}>
                      <Form.Label className="small">category</Form.Label>
                      <Form.Control value={row.category || ""} onChange={(e) => onChange(row.id, { category: e.target.value })} />
                    </Col>
                    <Col md={4}>
                      <Form.Label className="small">level</Form.Label>
                      <Form.Control
                        type="number"
                        value={row.level ?? ""}
                        onChange={(e) => onChange(row.id, { level: e.target.value })}
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
