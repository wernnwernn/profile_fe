import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner, Stack } from "react-bootstrap";
import { getErrMsg } from "../../services/api";
import {
  listExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  reorderExperiences,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  reorderHighlights,
} from "../../services/cms/experiencesApi";

const emptyExperience = {
  company_name: "",
  title: "",
  employment_type: "",
  location: "",
  start_date: "",
  end_date: "",
  is_current: false,
  description_md: "",
};

export default function AdminExperiences() {
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
      const rows = await listExperiences();
      setItems(rows.map((r) => ({ ...r, highlights: r.highlights || [] })));
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
      const row = await createExperience({ ...emptyExperience, start_date: new Date().toISOString().slice(0, 10) });
      setItems((prev) => [...prev, { ...row, highlights: [] }]);
      setAlert({ variant: "success", message: "เพิ่มแล้ว" });
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "เพิ่มไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const saveExperience = async (row) => {
    setSaving(true);
    try {
      if (!String(row.company_name || "").trim()) throw new Error("กรุณากรอก company_name");
      if (!String(row.title || "").trim()) throw new Error("กรุณากรอก title");
      if (!String(row.start_date || "").trim()) throw new Error("กรุณากรอก start_date");

      const payload = {
        company_name: row.company_name,
        title: row.title,
        employment_type: row.employment_type,
        location: row.location,
        start_date: row.start_date,
        end_date: row.end_date || null,
        is_current: !!row.is_current,
        description_md: row.description_md,
      };
      const updated = await updateExperience(row.id, payload);
      setItems((prev) => prev.map((x) => (x.id === row.id ? { ...updated, highlights: x.highlights || [] } : x)));
      setAlert({ variant: "success", message: "บันทึกแล้ว" });
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "บันทึกไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const removeExperience = async (id) => {
    if (!window.confirm("ลบ experience นี้?") ) return;
    setSaving(true);
    try {
      await deleteExperience(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setAlert({ variant: "success", message: "ลบแล้ว" });
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "ลบไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const moveExperience = async (id, dir) => {
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
      await reorderExperiences(orderedIds);
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "จัดลำดับไม่สำเร็จ" });
      fetchData();
    }
  };

  // ----- highlights -----
  const addHighlight = async (experience_id) => {
    setSaving(true);
    try {
      const row = await createHighlight({ experience_id, text: "" });
      setItems((prev) =>
        prev.map((x) => (x.id === experience_id ? { ...x, highlights: [...(x.highlights || []), row] } : x))
      );
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "เพิ่ม highlight ไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const saveHighlight = async (experience_id, h) => {
    setSaving(true);
    try {
      if (!String(h.text || "").trim()) throw new Error("กรุณากรอก text");
      const updated = await updateHighlight(h.id, { text: h.text });
      setItems((prev) =>
        prev.map((x) =>
          x.id === experience_id
            ? { ...x, highlights: (x.highlights || []).map((hh) => (hh.id === h.id ? updated : hh)) }
            : x
        )
      );
      setAlert({ variant: "success", message: "บันทึก highlight แล้ว" });
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "บันทึก highlight ไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const removeHighlight = async (experience_id, highlight_id) => {
    if (!window.confirm("ลบ highlight นี้?") ) return;
    setSaving(true);
    try {
      await deleteHighlight(highlight_id);
      setItems((prev) =>
        prev.map((x) =>
          x.id === experience_id ? { ...x, highlights: (x.highlights || []).filter((hh) => hh.id !== highlight_id) } : x
        )
      );
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "ลบ highlight ไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const moveHighlight = async (experience_id, highlight_id, dir) => {
    const exp = items.find((x) => x.id === experience_id);
    if (!exp) return;
    const hs = [...(exp.highlights || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.id ?? 0) - (b.id ?? 0));
    const idx = hs.findIndex((x) => x.id === highlight_id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= hs.length) return;
    const tmp = hs[idx];
    hs[idx] = hs[next];
    hs[next] = tmp;

    const orderedIds = hs.map((x) => x.id);
    // optimistic
    setItems((prev) =>
      prev.map((x) => (x.id === experience_id ? { ...x, highlights: hs.map((hh, i) => ({ ...hh, sort_order: i })) } : x))
    );

    try {
      await reorderHighlights(experience_id, orderedIds);
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "จัดลำดับ highlight ไม่สำเร็จ" });
      fetchData();
    }
  };

  const onChangeHighlightText = (experience_id, highlight_id, text) => {
    setItems((prev) =>
      prev.map((x) =>
        x.id === experience_id
          ? {
              ...x,
              highlights: (x.highlights || []).map((h) => (h.id === highlight_id ? { ...h, text } : h)),
            }
          : x
      )
    );
  };

  return (
    <div className="py-3">
      <Stack direction="horizontal" className="mb-3" gap={2}>
        <h4 className="m-0">Experiences</h4>
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
                    <Button size="sm" variant="outline-secondary" onClick={() => moveExperience(row.id, -1)} disabled={saving || i === 0}>
                      ↑
                    </Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => moveExperience(row.id, +1)} disabled={saving || i === sorted.length - 1}>
                      ↓
                    </Button>
                  </Stack>

                  <Row className="g-2">
                    <Col md={6}>
                      <Form.Label className="small">company_name</Form.Label>
                      <Form.Control value={row.company_name || ""} onChange={(e) => onChange(row.id, { company_name: e.target.value })} />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small">title</Form.Label>
                      <Form.Control value={row.title || ""} onChange={(e) => onChange(row.id, { title: e.target.value })} />
                    </Col>
                    <Col md={4}>
                      <Form.Label className="small">employment_type</Form.Label>
                      <Form.Control value={row.employment_type || ""} onChange={(e) => onChange(row.id, { employment_type: e.target.value })} />
                    </Col>
                    <Col md={4}>
                      <Form.Label className="small">location</Form.Label>
                      <Form.Control value={row.location || ""} onChange={(e) => onChange(row.id, { location: e.target.value })} />
                    </Col>
                    <Col md={2}>
                      <Form.Label className="small">start_date</Form.Label>
                      <Form.Control type="date" value={row.start_date ? String(row.start_date).slice(0, 10) : ""} onChange={(e) => onChange(row.id, { start_date: e.target.value })} />
                    </Col>
                    <Col md={2}>
                      <Form.Label className="small">end_date</Form.Label>
                      <Form.Control type="date" value={row.end_date ? String(row.end_date).slice(0, 10) : ""} onChange={(e) => onChange(row.id, { end_date: e.target.value || null })} />
                    </Col>
                    <Col md={12}>
                      <Form.Check type="switch" id={`cur-${row.id}`} label="is_current" checked={!!row.is_current} onChange={(e) => onChange(row.id, { is_current: e.target.checked })} />
                    </Col>
                    <Col md={12}>
                      <Form.Label className="small">description_md</Form.Label>
                      <Form.Control as="textarea" rows={3} value={row.description_md || ""} onChange={(e) => onChange(row.id, { description_md: e.target.value })} />
                    </Col>
                  </Row>

                  <Stack direction="horizontal" gap={2} className="mt-3">
                    <Button size="sm" variant="success" onClick={() => saveExperience(row)} disabled={saving}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => removeExperience(row.id)} disabled={saving}>
                      Delete
                    </Button>
                  </Stack>

                  <hr />

                  <Stack direction="horizontal" className="mb-2" gap={2}>
                    <div className="fw-semibold">Highlights</div>
                    <div className="ms-auto" />
                    <Button size="sm" variant="outline-primary" onClick={() => addHighlight(row.id)} disabled={saving}>
                      Add highlight
                    </Button>
                  </Stack>

                  {(row.highlights || []).length === 0 ? (
                    <div className="text-muted">ไม่มี highlights</div>
                  ) : (
                    (row.highlights || [])
                      .slice()
                      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.id ?? 0) - (b.id ?? 0))
                      .map((h, hi, arr) => (
                        <Card key={h.id} className="mb-2">
                          <Card.Body>
                            <Stack direction="horizontal" gap={2} className="mb-2">
                              <div className="text-muted small">#{hi + 1}</div>
                              <div className="ms-auto" />
                              <Button size="sm" variant="outline-secondary" onClick={() => moveHighlight(row.id, h.id, -1)} disabled={saving || hi === 0}>
                                ↑
                              </Button>
                              <Button size="sm" variant="outline-secondary" onClick={() => moveHighlight(row.id, h.id, +1)} disabled={saving || hi === arr.length - 1}>
                                ↓
                              </Button>
                            </Stack>

                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={h.text || ""}
                              onChange={(e) => onChangeHighlightText(row.id, h.id, e.target.value)}
                            />

                            <Stack direction="horizontal" gap={2} className="mt-2">
                              <Button size="sm" variant="success" onClick={() => saveHighlight(row.id, h)} disabled={saving}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline-danger" onClick={() => removeHighlight(row.id, h.id)} disabled={saving}>
                                Delete
                              </Button>
                            </Stack>
                          </Card.Body>
                        </Card>
                      ))
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
