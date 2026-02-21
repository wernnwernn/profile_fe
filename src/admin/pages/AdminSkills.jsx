import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner, Stack } from "react-bootstrap";
import { getErrMsg } from "../../services/api";
import { listSkills, createSkill, updateSkill, deleteSkill } from "../../services/cms/skillsApi";

export default function AdminSkills() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const rows = await listSkills();
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

  // ดึงรายการ Category ทั้งหมดที่มีตอนนี้เพื่อทำ Dropdown
  const allCategories = useMemo(() => {
    const cats = [...new Set(items.map(i => i.category).filter(Boolean))];
    return cats.sort();
  }, [items]);

  // จัดกลุ่มข้อมูลตาม category
  const groupedSkills = useMemo(() => {
    return items.reduce((acc, skill) => {
      const cat = skill.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  }, [items]);

  const onChange = (id, patch) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch, _isDirty: true } : x)));
  };

  const onRenameCategory = (oldCat, newCat) => {
    if (!newCat.trim() || oldCat === newCat) return;
    setItems((prev) => prev.map((x) => 
      (x.category || "Uncategorized") === oldCat ? { ...x, category: newCat, _isDirty: true } : x
    ));
  };

  const addNewSkill = (category = "") => {
    const tempId = `temp-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        id: tempId,
        name: "",
        category: category,
        is_active: true,
        _isNew: true,
        _isDirty: true,
      },
    ]);
  };

  const addNewCategory = () => {
    const name = prompt("ชื่อ Category ใหม่:");
    if (name?.trim()) addNewSkill(name.trim());
  };

  const saveAll = async () => {
    const dirtyItems = items.filter(x => x._isDirty);
    if (dirtyItems.length === 0) return;

    setSaving(true);
    try {
      for (const row of dirtyItems) {
        if (!row.name.trim()) continue;
        const payload = {
          name: row.name,
          category: row.category,
          is_active: !!row.is_active,
        };
        row._isNew ? await createSkill(payload) : await updateSkill(row.id, payload);
      }
      setAlert({ variant: "success", message: "บันทึกการเปลี่ยนแปลงทั้งหมดแล้ว" });
      fetchData();
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "บันทึกไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const removeRow = async (id) => {
    const row = items.find((x) => x.id === id);
    if (row?._isNew) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      return;
    }
    if (!window.confirm("ลบรายการนี้?")) return;
    try {
      await deleteSkill(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setAlert({ variant: "success", message: "ลบแล้ว" });
    } catch (e) {
      setAlert({ variant: "danger", message: "ลบไม่สำเร็จ" });
    }
  };

  return (
    <div className="py-3">
      <Stack direction="horizontal" className="mb-3" gap={2}>
        <h4 className="m-0 text-white">Skills</h4>
        <div className="ms-auto" />
        <Button variant="outline-light" size="sm" onClick={addNewCategory} disabled={saving}>
          + New Category
        </Button>
        <Button variant="primary" size="sm" onClick={saveAll} disabled={saving}>
          {saving ? <Spinner size="sm" /> : "Save All"}
        </Button>
      </Stack>

      {alert && (
        <Alert variant={alert.variant} onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5 "><Spinner /></div>
      ) : (
        <Stack gap={5}>
          {Object.entries(groupedSkills).map(([catName, skills]) => (
            <div key={catName} className="bg-dark p-3 rounded">
              <div className="d-flex align-items-center mb-3 ">
                <Form.Control
                  size="sm"
                  className="bg-transparent border-0 border-bottom text-white fw-bold w-auto"
                  style={{ fontSize: "1.2rem", borderRadius: 0, paddingLeft: 0 }}
                  defaultValue={catName === "Uncategorized" ? "" : catName}
                  placeholder="(Click to name)"
                  onBlur={(e) => onRenameCategory(catName, e.target.value)}
                />
                <Button variant="outline-info" size="sm" className="ms-2 text-info text-decoration-none" onClick={() => addNewSkill(catName === "Uncategorized" ? "" : catName)}>
                  + Add in this group
                </Button>
              </div>

{skills.map((row, i) => (
  <Card key={row.id ?? i} className={row._isDirty ? "border-warning" : ""}>
    <Card.Body>
      <Row className="g-2 align-items-end">
        <Col xs="auto">
          <div className="fw-semibold text-muted small">#{i + 1}</div>
        </Col>

        <Col xs={12} md={5}>
          <Form.Label className="small text-muted mb-1">name</Form.Label>
          <Form.Control
            size="sm"
            value={row.name || ""}
            onChange={(e) => onChange(row.id, { name: e.target.value })}
          />
        </Col>

        <Col xs={12} md={3}>
          <Form.Label className="small text-muted mb-1">move to</Form.Label>
          <Form.Select
            size="sm"
            value={row.category || ""}
            onChange={(e) => onChange(row.id, { category: e.target.value })}
          >
            <option value="">Uncategorized</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col xs={12} md={3}>
          <div className="d-flex align-items-center justify-content-md-start justify-content-start gap-2">
            <Form.Check
              type="switch"
              label="active"
              className="mb-0"
              checked={!!row.is_active}
              onChange={(e) => onChange(row.id, { is_active: e.target.checked })}
            />
            <Button
              size="sm"
              variant="outline-danger"
              className="border-0"
              onClick={() => removeRow(row.id)}
            >
              Delete
            </Button>
          </div>
        </Col>
      </Row>
    </Card.Body>
  </Card>
))}
            </div>
          ))}
        </Stack>
      )}
    </div>
  );
}