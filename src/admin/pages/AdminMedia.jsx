// AdminMedia.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Modal,
  Row,
  Spinner,
  Stack,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { getErrMsg } from "../../services/api";
import {
  deleteMedia,
  listMedia,
  mediaUrl,
  uploadMedia,
  refreshMediaCache,
} from "../../services/cms/mediaApi";
import { getToken } from "../../services/tokenStorage"; // ✅ ปรับ path ให้ตรงโปรเจคคุณ

const isImage = (mime) => String(mime || "").toLowerCase().startsWith("image/");
const fmtKB = (bytes) => Math.round(Number(bytes || 0) / 1024);

const fetchBlobUrl = async (id) => {
  const token = getToken();
  const res = await fetch(mediaUrl(id), {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`โหลดไฟล์ไม่สำเร็จ (${res.status}) ${text}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

export default function AdminMedia() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const decodedToken = useMemo(() => {
    try {
      const t = getToken();
      return JSON.parse(atob(t.split(".")[1]));
    } catch { return null; }
  }, []);
  const isRoleUser = decodedToken?.role === "user";

  const [q, setQ] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 24;

  const [rows, setRows] = useState([]);

  // ✅ preview urls (object URLs)
  const [previewMap, setPreviewMap] = useState({}); // { [id]: objectUrl }
  const previewMapRef = useRef(previewMap);
  useEffect(() => {
    previewMapRef.current = previewMap;
  }, [previewMap]);

  // ✅ modal preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const fetchData = async (next = {}) => {
    setLoading(true);
    try {
      const data = await listMedia({
        q: next.q ?? q,
        limit,
        offset: next.offset ?? offset,
      });
      setRows(Array.isArray(data) ? data : []);
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
      toast.success("อัปโหลดแล้ว");
      setAlert({ variant: "success", message: "อัปโหลดแล้ว" });
      setOffset(0);
      await fetchData({ offset: 0 });
    } catch (e) {
      toast.error(getErrMsg(e) || "อัปโหลดไม่สำเร็จ");
      setAlert({ variant: "danger", message: getErrMsg(e) || "อัปโหลดไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const onRefreshCache = async () => {
    setSaving(true);
    try {
      await refreshMediaCache();
      toast.success("รีเฟรชแคชแล้ว");
      setAlert({ variant: "success", message: "รีเฟรชแคชแล้ว" });
    } catch (e) {
      toast.error(getErrMsg(e) || "รีเฟรชแคชไม่สำเร็จ");
      setAlert({ variant: "danger", message: getErrMsg(e) || "รีเฟรชแคชไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("ลบไฟล์นี้? (ถ้าไฟล์ถูกใช้งานอยู่ ระบบจะไม่ให้ลบ)")) return;

    setSaving(true);
    try {
      await deleteMedia(id);

      // ✅ revoke preview if exists
      setPreviewMap((prev) => {
        const next = { ...prev };
        if (next[id]) {
          try {
            URL.revokeObjectURL(next[id]);
          } catch { }
          delete next[id];
        }
        return next;
      });

      setRows((prev) => prev.filter((x) => x.id !== id));
      toast.success("ลบแล้ว");
      setAlert({ variant: "success", message: "ลบแล้ว" });
    } catch (e) {
      toast.error(getErrMsg(e) || "ลบไม่สำเร็จ");
      setAlert({ variant: "danger", message: getErrMsg(e) || "ลบไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  // ✅ total size
  const totalBytes = useMemo(
    () => rows.reduce((a, b) => a + Number(b.size_bytes || 0), 0),
    [rows]
  );

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("คัดลอกแล้ว");
      setAlert({ variant: "success", message: "คัดลอกแล้ว" });
    } catch {
      toast.error("คัดลอกไม่สำเร็จ");
    }
  };

  // ✅ preload previews for current page (images only)
  useEffect(() => {
    let cancelled = false;

    const currentImageIds = rows
      .filter((r) => isImage(r.mime_type))
      .map((r) => Number(r.id))
      .filter((x) => Number.isFinite(x));

    // cleanup previews not on current page
    setPreviewMap((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        const id = Number(k);
        if (!currentImageIds.includes(id)) {
          try {
            URL.revokeObjectURL(next[id]);
          } catch { }
          delete next[id];
        }
      }
      return next;
    });

    const load = async () => {
      for (const id of currentImageIds) {
        if (cancelled) return;

        const exists = previewMapRef.current[id];
        if (exists) continue;

        try {
          const objUrl = await fetchBlobUrl(id);
          if (cancelled) {
            try {
              URL.revokeObjectURL(objUrl);
            } catch { }
            return;
          }
          setPreviewMap((prev) => ({ ...prev, [id]: objUrl }));
        } catch (e) {
          // ignore (ยังแสดงชื่อไฟล์ได้)
          // console.warn("preview failed", id, e);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [rows]);

  // ✅ revoke all previews on unmount
  useEffect(() => {
    return () => {
      const m = previewMapRef.current;
      for (const u of Object.values(m)) {
        try {
          URL.revokeObjectURL(u);
        } catch { }
      }
    };
  }, []);

  const openPreview = async (item) => {
    setPreviewItem(item);
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewUrl("");

    try {
      if (isImage(item?.mime_type)) {
        // reuse existing preview if any
        const existing = previewMapRef.current[item.id];
        if (existing) {
          setPreviewUrl(existing);
        } else {
          const objUrl = await fetchBlobUrl(item.id);
          // อย่าลืมเก็บลง map ด้วย จะได้ไม่โหลดซ้ำ
          setPreviewMap((prev) => ({ ...prev, [item.id]: objUrl }));
          setPreviewUrl(objUrl);
        }
      } else {
        setPreviewUrl("");
      }
    } catch (e) {
      toast.error(getErrMsg(e) || "เปิดพรีวิวไม่สำเร็จ");
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewItem(null);
    setPreviewUrl("");
    setPreviewLoading(false);
  };

  return (
    <div className="py-3">
      {/* Header */}
      <Stack direction="horizontal" className="mb-3" gap={2}>
        <h4 className="m-0">Media</h4>
        <div className="ms-auto" />
        <Button variant="outline-primary" onClick={onRefreshCache} disabled={saving}>
          Refresh Cache
        </Button>
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

      {/* Role Notice */}
      {isRoleUser && (
        <Alert variant="info" className="mb-3 py-2">
          <strong><i className="bi bi-info-circle me-1"></i> ข้อควรทราบ:</strong> บัญชีผู้ใช้ทั่วไปรับสิทธิ์สามารถอัปโหลดไฟล์สื่อได้สูงสุด 5 ไฟล์เท่านั้น
        </Alert>
      )}

      {/* Alert */}
      {alert ? (
        <Alert variant={alert.variant} onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      ) : null}

      {/* Search */}
      <Card className="mb-3">
        <Card.Body>
          <Row className="g-2 align-items-end">
            <Col md={8}>
              <Form.Label className="small">ค้นหา (ชื่อไฟล์ / mime)</Form.Label>
              <InputGroup>
                <Form.Control
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSearch()}
                />
                <Button
                  variant="outline-secondary"
                  onClick={onSearch}
                  disabled={loading}
                >
                  Search
                </Button>
              </InputGroup>
            </Col>
            <Col md={4}>
              <div className="text-secondary small">
                แสดง {rows.length} รายการ · {Math.round(totalBytes / 1024)} KB
              </div>
              <Stack direction="horizontal" gap={2}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={!canPrev || loading}
                  onClick={() => setOffset((v) => Math.max(0, v - limit))}
                >
                  Prev
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={!canNext || loading}
                  onClick={() => setOffset((v) => v + limit)}
                >
                  Next
                </Button>
                <div className="ms-auto text-secondary small">offset: {offset}</div>
              </Stack>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-secondary">ไม่พบข้อมูล</div>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-3">
          {rows.map((m) => {
            const apiPath = mediaUrl(m.id);
            const fullUrl = window.location.origin + apiPath;
            const thumb = isImage(m.mime_type) ? previewMap[m.id] : "";

            return (
              <Col key={m.id}>
                <Card className="h-100 shadow-sm">
                  {/* Thumb */}
                  <div
                    className="bg-body-tertiary position-relative"
                    style={{ height: 170, overflow: "hidden", cursor: "pointer" }}
                    onClick={() => openPreview(m)}
                    title="คลิกเพื่อดูพรีวิว"
                  >
                    {isImage(m.mime_type) ? (
                      thumb ? (
                        <img
                          alt={m.alt_text || m.original_name}
                          src={thumb}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100">
                          <Spinner size="sm" />
                        </div>
                      )
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <div className="text-secondary">No preview</div>
                      </div>
                    )}

                    {/* Overlay */}
                    <div
                      className="position-absolute top-0 start-0 end-0"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(0,0,0,.55), rgba(0,0,0,0))",
                        padding: "8px 10px",
                      }}
                    >
                      <div className="d-flex gap-2 flex-wrap">
                        <Badge bg="dark">#{m.id}</Badge>
                        <Badge bg="info">{m.mime_type}</Badge>
                        <Badge bg="secondary">{fmtKB(m.size_bytes)} KB</Badge>
                      </div>
                    </div>
                  </div>

                  <Card.Body>
                    <div className="fw-semibold text-truncate" title={m.original_name}>
                      {m.original_name}
                    </div>

                    <Stack direction="horizontal" gap={2} className="mt-3">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => copy(fullUrl)}
                      >
                        Copy URL
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="ms-auto"
                        onClick={() => onDelete(m.id)}
                        disabled={saving}
                      >
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

      {/* Preview Modal */}
      <Modal show={previewOpen} onHide={closePreview} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fs-6">
            {previewItem?.original_name || "Preview"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!previewItem ? null : previewLoading ? (
            <div className="text-center py-5">
              <Spinner />
            </div>
          ) : isImage(previewItem.mime_type) ? (
            previewUrl ? (
              <div className="text-center">
                <img
                  alt={previewItem.alt_text || previewItem.original_name}
                  src={previewUrl}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    borderRadius: 12,
                  }}
                />
              </div>
            ) : (
              <div className="text-secondary">ไม่สามารถโหลดรูปได้</div>
            )
          ) : (
            <div className="text-secondary">
              ไฟล์นี้ไม่รองรับ preview (mime: {previewItem.mime_type})
            </div>
          )}

          {previewItem ? (
            <div className="mt-3 small text-secondary">
              <div>
                <span className="me-2">ID:</span>
                <span className="text-dark-emphasis">#{previewItem.id}</span>
              </div>
              <div>
                <span className="me-2">Type:</span>
                <span className="text-dark-emphasis">{previewItem.mime_type}</span>
              </div>
              <div>
                <span className="me-2">Size:</span>
                <span className="text-dark-emphasis">{fmtKB(previewItem.size_bytes)} KB</span>
              </div>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          {previewItem ? (
            <>
              <Button
                variant="outline-secondary"
                onClick={() => copy(window.location.origin + mediaUrl(previewItem.id))}
              >
                Copy URL
              </Button>
              <Button
                variant="outline-danger"
                disabled={saving}
                onClick={() => onDelete(previewItem.id)}
              >
                Delete
              </Button>
            </>
          ) : null}
          <Button variant="secondary" onClick={closePreview}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
