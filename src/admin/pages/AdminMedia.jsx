import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
  Spinner,
  Stack,
} from "react-bootstrap";
import { getErrMsg } from "../../services/api";
import { deleteMedia, listMedia, mediaUrl, uploadMedia } from "../../services/cms/mediaApi";

const isImage = (mime) => String(mime || "").toLowerCase().startsWith("image/");

export default function AdminMedia() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const [q, setQ] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 24;

  const [rows, setRows] = useState([]);

  const fetchData = async (next = {}) => {
    setLoading(true);
    try {
      const data = await listMedia({ q: next.q ?? q, limit, offset: next.offset ?? offset });
      setRows(data);
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "โหลดข้อมูลไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  const canPrev = offset > 0;
  const canNext = rows.length === limit;

  const onSearch = async () => {
    setOffset(0);
    await fetchData({ offset: 0, q });
  };

  const onUpload = async (file) => {
    if (!file) return;
    setSaving(true);
    try {
      await uploadMedia(file);
      setAlert({ variant: "success", message: "อัปโหลดแล้ว" });
      setOffset(0);
      await fetchData({ offset: 0 });
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "อัปโหลดไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("ลบไฟล์นี้? (ถ้าไฟล์ถูกใช้งานอยู่ ระบบจะไม่ให้ลบ)") ) return;
    setSaving(true);
    try {
      await deleteMedia(id);
      setRows((prev) => prev.filter((x) => x.id !== id));
      setAlert({ variant: "success", message: "ลบแล้ว" });
    } catch (e) {
      setAlert({ variant: "danger", message: getErrMsg(e) || "ลบไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const totalBytes = useMemo(() => rows.reduce((a, b) => a + Number(b.size_bytes || 0), 0), [rows]);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setAlert({ variant: "success", message: "คัดลอกแล้ว" });
    } catch {
      // ignore
    }
  };

  return (
    <div className="py-3">
      <Stack direction="horizontal" className="mb-3" gap={2}>
        <h4 className="m-0">Media</h4>
        <div className="ms-auto" />
        <Form.Label className="btn btn-primary mb-0">
          {saving ? "Uploading..." : "Upload"}
          <Form.Control
            type="file"
            disabled={saving}
            onChange={(e) => onUpload(e.target.files?.[0])}
            style={{ display: "none" }}
          />
        </Form.Label>
      </Stack>

      {alert ? (
        <Alert variant={alert.variant} onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      ) : null}

      <Card className="mb-3">
        <Card.Body>
          <Row className="g-2 align-items-end">
            <Col md={8}>
              <Form.Label className="small">ค้นหา (ชื่อไฟล์ / mime)</Form.Label>
              <InputGroup>
                <Form.Control value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSearch()} />
                <Button variant="outline-secondary" onClick={onSearch} disabled={loading}>
                  Search
                </Button>
              </InputGroup>
            </Col>
            <Col md={4}>
              <div className="text-secondary small">
                แสดง {rows.length} รายการ · {Math.round(totalBytes / 1024)} KB
              </div>
              <Stack direction="horizontal" gap={2}>
                <Button variant="outline-secondary" size="sm" disabled={!canPrev || loading} onClick={() => setOffset((v) => Math.max(0, v - limit))}>
                  Prev
                </Button>
                <Button variant="outline-secondary" size="sm" disabled={!canNext || loading} onClick={() => setOffset((v) => v + limit)}>
                  Next
                </Button>
                <div className="ms-auto text-secondary small">offset: {offset}</div>
              </Stack>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-secondary">ไม่พบข้อมูล</div>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-3">
          {rows.map((m) => {
            const url = mediaUrl(m.id);
            return (
              <Col key={m.id}>
                <Card className="h-100">
                  {isImage(m.mime_type) ? (
                    <div className="bg-body-tertiary" style={{ height: 160, overflow: "hidden" }}>
                      <img alt={m.alt_text || m.original_name} src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center bg-body-tertiary" style={{ height: 160 }}>
                      <div className="text-secondary">No preview</div>
                    </div>
                  )}
                  <Card.Body>
                    <div className="fw-semibold text-truncate" title={m.original_name}>
                      {m.original_name}
                    </div>
                    <div className="d-flex flex-wrap gap-1 mt-2">
                      <Badge bg="secondary">#{m.id}</Badge>
                      <Badge bg="info">{m.mime_type}</Badge>
                      <Badge bg="dark">{Math.round(Number(m.size_bytes || 0) / 1024)} KB</Badge>
                    </div>

                    <Stack direction="horizontal" gap={2} className="mt-3">
                      <Button size="sm" variant="outline-secondary" onClick={() => copy(window.location.origin + url)}>
                        Copy URL
                      </Button>
                      <Button size="sm" variant="outline-danger" className="ms-auto" onClick={() => onDelete(m.id)} disabled={saving}>
                        Delete
                      </Button>
                    </Stack>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
