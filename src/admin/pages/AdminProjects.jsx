import React, { useEffect, useMemo, useState } from "react";
import {
  // Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Stack,
} from "react-bootstrap";
import { getErrMsg } from "../../services/api";
import { mediaUrl } from "../../services/cms/mediaApi";
import {
  addProjectMedia,
  createProject,
  deleteProject,
  // deleteProjectMedia,
  listProjects,
  // reorderProjectMedias,
  reorderProjects,
  // setProjectTags,
  updateProject,
  // updateProjectMedia,
} from "../../services/cms/projectsApi";
// import { listTags } from "../../services/cms/tagsApi";
import { useNotify } from "../../ui/NotificationProvider";
import MediaPickerModal from "../components/MediaPickerModal";

const parseTech = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    const j = JSON.parse(v);
    if (Array.isArray(j)) return j;
    return [];
  } catch {
    return [];
  }
};

const techToText = (arr) => (Array.isArray(arr) ? arr.filter(Boolean).join(", ") : "");
const textToTech = (text) =>
  String(text || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export default function AdminProjects() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerState, setPickerState] = useState(null); // { type: 'cover' | 'gallery', projectId: 1 }
  const notify = useNotify();

  const [projects, setProjects] = useState([]);
  // const [allTags, setAllTags] = useState([]);

  // create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ slug: "", title: "" });

  // collapse state
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedIds(new Set(projects.map(p => p.id)));
  const collapseAll = () => setExpandedIds(new Set());

  const allExpanded = useMemo(() => {
    if (projects.length === 0) return false;
    return projects.every((p) => expandedIds.has(p.id));
  }, [projects, expandedIds]);

  const toggleExpandAll = () => {
    if (allExpanded) collapseAll();
    else expandAll();
  };

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.id ?? 0) - (b.id ?? 0));
  }, [projects]);

  const fetchData = useMemo(() => async () => {
    setLoading(true);
    try {
      const [
        ps, 
        // ts
      ] = await Promise.all([
        listProjects(), 
        // listTags()
      ]);
      // setAllTags(ts);
      setProjects(
        (ps || []).map((p) => ({
          ...p,
          // normalize
          tech_stack_list: parseTech(p.tech_stack_json),
          tech_stack_text: techToText(parseTech(p.tech_stack_json)),
          medias: p.medias || [],
          tags: p.tags || [],
        }))
      );
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
    setProjects((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const openCreate = () => {
    setCreateForm({ slug: "", title: "" });
    setShowCreate(true);
  };

  const doCreate = async () => {
    setSaving(true);
    try {
      const slug = String(createForm.slug || "").trim();
      const title = String(createForm.title || "").trim();
      if (!slug) throw new Error("กรุณากรอก slug");
      if (!title) throw new Error("กรุณากรอก title");

      const row = await createProject({ slug, title, status: "draft" });
      setProjects((prev) => [...prev, { ...row, tech_stack_list: [], tech_stack_text: "", medias: [], tags: [] }]);
      setExpandedIds(prev => new Set(prev).add(row.id)); // expanded by default on create
      notify.success("สร้างแล้ว");
      setShowCreate(false);
    } catch (e) {
      notify.error(getErrMsg(e) || "สร้างไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const saveProject = async (p) => {
    setSaving(true);
    try {
      const payload = {
        slug: String(p.slug || "").trim(),
        title: String(p.title || "").trim(),
        summary: String(p.summary || "").trim(),
        description_md: p.description_md ?? "",
        role: String(p.role || "").trim(),
        tech_stack_json: textToTech(p.tech_stack_text),
        start_date: p.start_date || null,
        end_date: p.end_date || null,
        status: p.status || "draft",
        is_featured: !!p.is_featured,
        cover_media_id: p.cover_media_id === "" || p.cover_media_id === null || p.cover_media_id === undefined ? null : Number(p.cover_media_id),
        demo_url: String(p.demo_url || "").trim(),
        repo_url: String(p.repo_url || "").trim(),
      };

      const updated = await updateProject(p.id, payload);
      // keep local extras
      const norm = {
        ...updated,
        tech_stack_list: parseTech(updated.tech_stack_json),
        tech_stack_text: techToText(parseTech(updated.tech_stack_json)),
        medias: updated.medias || [],
        tags: updated.tags || [],
      };
      setProjects((prev) => prev.map((x) => (x.id === p.id ? norm : x)));
      notify.success("บันทึกแล้ว");
    } catch (e) {
      notify.error(getErrMsg(e) || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const removeProject = async (id) => {
    if (!window.confirm("ลบ project นี้?")) return;
    setSaving(true);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((x) => x.id !== id));
      notify.success("ลบแล้ว");
    } catch (e) {
      notify.error(getErrMsg(e) || "ลบไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const moveProject = async (id, dir) => {
    const arr = [...sorted];
    const idx = arr.findIndex((x) => x.id === id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= arr.length) return;
    const tmp = arr[idx];
    arr[idx] = arr[next];
    arr[next] = tmp;

    const orderedIds = arr.map((x) => x.id);
    setProjects(arr.map((x, i) => ({ ...x, sort_order: i })));

    try {
      await reorderProjects(orderedIds);
    } catch (e) {
      notify.error(getErrMsg(e) || "จัดลำดับไม่สำเร็จ");
      fetchData();
    }
  };

  // ---------- tags ----------
  // const toggleTag = async (projectId, tagId) => {
  //   setSaving(true);
  //   try {
  //     const p = projects.find((x) => x.id === projectId);
  //     if (!p) return;
  //     const currentIds = new Set((p.tags || []).map((t) => Number(t.id)));
  //     if (currentIds.has(tagId)) currentIds.delete(tagId);
  //     else currentIds.add(tagId);

  //     const nextIds = Array.from(currentIds);
  //     await setProjectTags(projectId, nextIds);
  //     await fetchData();
  //     notify.success("อัปเดต tags แล้ว");
  //   } catch (e) {
  //     notify.error(getErrMsg(e) || "อัปเดต tags ไม่สำเร็จ");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  // ---------- media ----------
  const applyCoverMedia = async (projectId, mediaId) => {
    if (!mediaId) return;
    setSaving(true);
    try {
      await updateProject(projectId, { cover_media_id: mediaId });
      await fetchData();
      notify.success("อัปเดต cover แล้ว");
    } catch (e) {
      notify.error(getErrMsg(e) || "อัปเดต cover ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const clearCoverMedia = async (projectId) => {
    setSaving(true);
    try {
      await updateProject(projectId, { cover_media_id: null });
      await fetchData();
      notify.success("ยกเลิก cover แล้ว");
    } catch (e) {
      notify.error(getErrMsg(e) || "ยกเลิก cover ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const applyGalleryMedia = async (projectId, mediaId) => {
    if (!mediaId) return;
    setSaving(true);
    try {
      await addProjectMedia(projectId, { media_id: mediaId, caption: "" });
      await fetchData();
      notify.success("เพิ่มรูปแล้ว");
    } catch (e) {
      notify.error(getErrMsg(e) || "เพิ่มรูปไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  // const saveCaption = async (projectMediaId, caption) => {
  //   setSaving(true);
  //   try {
  //     await updateProjectMedia(projectMediaId, { caption });
  //     await fetchData();
  //     notify.success("บันทึก caption แล้ว");
  //   } catch (e) {
  //     notify.error(getErrMsg(e) || "บันทึก caption ไม่สำเร็จ");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  // const removeGalleryMedia = async (projectMediaId) => {
  //   if (!window.confirm("ลบรูปนี้ออกจาก project?")) return;
  //   setSaving(true);
  //   try {
  //     await deleteProjectMedia(projectMediaId);
  //     await fetchData();
  //     notify.success("ลบแล้ว");
  //   } catch (e) {
  //     notify.error(getErrMsg(e) || "ลบไม่สำเร็จ");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  // const moveGalleryMedia = async (projectId, projectMediaId, dir) => {
  //   const p = projects.find((x) => x.id === projectId);
  //   if (!p) return;
  //   const ms = [...(p.medias || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.id ?? 0) - (b.id ?? 0));
  //   const idx = ms.findIndex((x) => x.id === projectMediaId);
  //   if (idx < 0) return;
  //   const next = idx + dir;
  //   if (next < 0 || next >= ms.length) return;
  //   const tmp = ms[idx];
  //   ms[idx] = ms[next];
  //   ms[next] = tmp;

  //   const orderedIds = ms.map((x) => x.id);
  //   setSaving(true);
  //   try {
  //     await reorderProjectMedias(projectId, orderedIds);
  //     await fetchData();
  //   } catch (e) {
  //     notify.error(getErrMsg(e) || "จัดลำดับรูปไม่สำเร็จ");
  //     await fetchData();
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  return (
    <div className="py-3">
      <Stack direction="horizontal" className="mb-3" gap={2}>
        <h4 className="m-0">Projects</h4>
        {projects.length > 0 && (
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={toggleExpandAll}
          >
            {allExpanded ? "ย่อทั้งหมด" : "ขยายทั้งหมด"}
          </Button>
        )}
        <div className="ms-auto" />
        <Button variant="primary" onClick={openCreate} disabled={saving}>
          {saving ? <Spinner size="sm" /> : "Add"}
        </Button>
      </Stack>

      {loading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-secondary">ยังไม่มี projects</div>
      ) : (
        <Row xs={1} className="g-3">
          {sorted.map((p, i) => {
            const coverUrl = p.cover_media_id ? mediaUrl(p.cover_media_id) : "";
            // const tagIdSet = new Set((p.tags || []).map((t) => Number(t.id)));
            return (
              <Col key={p.id}>
                <Card>
                  <Card.Body>
                    <Stack direction="horizontal" gap={2} className="mb-2">
                      <div className="fw-semibold" style={{ cursor: "pointer" }} onClick={() => toggleExpand(p.id)}>
                        {expandedIds.has(p.id) ? "▼" : "▶"} #{i + 1} · {p.title || "(no title)"} <span className="text-secondary">(id: {p.id})</span>
                      </div>
                      <div className="ms-auto" />
                      <Button size="sm" variant="outline-secondary" onClick={() => moveProject(p.id, -1)} disabled={saving || i === 0}>
                        ↑
                      </Button>
                      <Button size="sm" variant="outline-secondary" onClick={() => moveProject(p.id, +1)} disabled={saving || i === sorted.length - 1}>
                        ↓
                      </Button>
                    </Stack>

                    {expandedIds.has(p.id) && (
                      <>
                        <Row className="g-3">
                          <Col md={4}>
                            <div className="bg-body-tertiary rounded" style={{ height: 180, overflow: "hidden" }}>
                              {coverUrl ? (
                                <img alt="cover" src={coverUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 text-secondary">No cover</div>
                              )}
                            </div>
                            <Button variant="outline-primary" className="w-100 mt-2 mb-0" onClick={() => setPickerState({ type: "cover", projectId: p.id })} disabled={saving}>
                              เลือก cover
                            </Button>
                            {coverUrl && (
                              <Button variant="outline-danger" className="w-100 mt-2 mb-0" onClick={() => clearCoverMedia(p.id)} disabled={saving}>
                                ยกเลิก cover
                              </Button>
                            )}
                            <div className="text-secondary small mt-2">cover_media_id: {p.cover_media_id || "-"}</div>
                          </Col>

                          <Col md={8}>
                            <Row className="g-2">
                              <Col md={6}>
                                <Form.Label className="small">slug</Form.Label>
                                <Form.Control value={p.slug || ""} onChange={(e) => onChange(p.id, { slug: e.target.value })} />
                              </Col>
                              <Col md={6}>
                                <Form.Label className="small">status</Form.Label>
                                <Form.Select value={p.status || "draft"} onChange={(e) => onChange(p.id, { status: e.target.value })}>
                                  <option value="draft">draft</option>
                                  <option value="active">active</option>
                                  <option value="completed">completed</option>
                                </Form.Select>
                              </Col>
                              <Col md={12}>
                                <Form.Label className="small">title</Form.Label>
                                <Form.Control value={p.title || ""} onChange={(e) => onChange(p.id, { title: e.target.value })} />
                              </Col>
                              <Col md={12}>
                                <Form.Label className="small">summary</Form.Label>
                                <Form.Control value={p.summary || ""} onChange={(e) => onChange(p.id, { summary: e.target.value })} />
                              </Col>
                              <Col md={12}>
                                <Form.Label className="small">description_md</Form.Label>
                                <Form.Control as="textarea" rows={4} value={p.description_md || ""} onChange={(e) => onChange(p.id, { description_md: e.target.value })} />
                              </Col>
                              <Col md={6}>
                                <Form.Label className="small">role</Form.Label>
                                <Form.Control value={p.role || ""} onChange={(e) => onChange(p.id, { role: e.target.value })} />
                              </Col>
                              <Col md={6}>
                                <Form.Label className="small">tech stack (comma)</Form.Label>
                                <Form.Control value={p.tech_stack_text || ""} onChange={(e) => onChange(p.id, { tech_stack_text: e.target.value })} />
                              </Col>
                              <Col md={6}>
                                <Form.Label className="small">start_date</Form.Label>
                                <Form.Control type="date" value={p.start_date ? String(p.start_date).slice(0, 10) : ""} onChange={(e) => onChange(p.id, { start_date: e.target.value || null })} />
                              </Col>
                              <Col md={6}>
                                <Form.Label className="small">end_date</Form.Label>
                                <Form.Control type="date" value={p.end_date ? String(p.end_date).slice(0, 10) : ""} onChange={(e) => onChange(p.id, { end_date: e.target.value || null })} />
                              </Col>
                              <Col md={6}>
                                <Form.Label className="small">demo_url</Form.Label>
                                <Form.Control value={p.demo_url || ""} onChange={(e) => onChange(p.id, { demo_url: e.target.value })} />
                              </Col>
                              <Col md={6}>
                                <Form.Label className="small">repo_url</Form.Label>
                                <Form.Control value={p.repo_url || ""} onChange={(e) => onChange(p.id, { repo_url: e.target.value })} />
                              </Col>
                              <Col md={12}>
                                <Form.Check type="switch" id={`featured-${p.id}`} label="featured" checked={!!p.is_featured} onChange={(e) => onChange(p.id, { is_featured: e.target.checked })} />
                              </Col>
                            </Row>

                            <Stack direction="horizontal" gap={2} className="mt-3">
                              <Button size="sm" variant="success" onClick={() => saveProject(p)} disabled={saving}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline-danger" onClick={() => removeProject(p.id)} disabled={saving}>
                                Delete
                              </Button>
                            </Stack>
                          </Col>
                        </Row>

                        {/* tags */}
                        {/* <hr className="my-4" />
                        <div className="fw-semibold mb-2">Tags</div>
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          {(p.tags || []).length === 0 ? <span className="text-secondary">ยังไม่มี</span> : null}
                          {(p.tags || []).map((t) => (
                            <Badge bg="secondary" key={t.id}>
                              {t.name}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-secondary small mb-2">คลิกเพื่อเลือก/ยกเลิก</div>
                        <div className="d-flex flex-wrap gap-2">
                          {allTags.map((t) => (
                            <Button
                              key={t.id}
                              size="sm"
                              variant={tagIdSet.has(Number(t.id)) ? "primary" : "outline-secondary"}
                              onClick={() => toggleTag(p.id, Number(t.id))}
                              disabled={saving}
                            >
                              {t.name}
                            </Button>
                          ))}
                        </div> */}

                        {/* gallery */}
                        {/* <hr className="my-4" />
                        <Stack direction="horizontal" className="mb-2" gap={2}>
                          <div className="fw-semibold">Gallery</div>
                          <div className="ms-auto" />
                          <Button variant="outline-primary" onClick={() => setPickerState({ type: "gallery", projectId: p.id })} disabled={saving}>
                            เพิ่มรูปจาก Media
                          </Button>
                        </Stack>

                        {(p.medias || []).length === 0 ? (
                          <div className="text-secondary">ยังไม่มีรูปใน project นี้</div>
                        ) : (
                          <Row xs={1} md={3} className="g-3">
                            {[...(p.medias || [])]
                              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.id ?? 0) - (b.id ?? 0))
                              .map((pm, mi, arr) => {
                                const url = mediaUrl(pm.media_id);
                                return (
                                  <Col key={pm.id}>
                                    <Card className="h-100">
                                      <div className="bg-body-tertiary" style={{ height: 140, overflow: "hidden" }}>
                                        <img alt={pm.caption || "media"} src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                      </div>
                                      <Card.Body>
                                        <div className="d-flex flex-wrap gap-1 mb-2">
                                          <Badge bg="secondary">pm:{pm.id}</Badge>
                                          <Badge bg="dark">m:{pm.media_id}</Badge>
                                        </div>
                                        <Form.Control
                                          as="textarea"
                                          rows={2}
                                          defaultValue={pm.caption || ""}
                                          onBlur={(e) => saveCaption(pm.id, e.target.value)}
                                          placeholder="caption (save on blur)"
                                          disabled={saving}
                                        />
                                        <Stack direction="horizontal" gap={2} className="mt-2">
                                          <Button size="sm" variant="outline-secondary" onClick={() => moveGalleryMedia(p.id, pm.id, -1)} disabled={saving || mi === 0}>
                                            ↑
                                          </Button>
                                          <Button size="sm" variant="outline-secondary" onClick={() => moveGalleryMedia(p.id, pm.id, +1)} disabled={saving || mi === arr.length - 1}>
                                            ↓
                                          </Button>
                                          <Button size="sm" variant="outline-danger" className="ms-auto" onClick={() => removeGalleryMedia(pm.id)} disabled={saving}>
                                            Delete
                                          </Button>
                                        </Stack>
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                );
                              })}
                          </Row>
                        )} */}
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-2">
            <Col md={12}>
              <Form.Label className="small">slug</Form.Label>
              <Form.Control value={createForm.slug} onChange={(e) => setCreateForm((p) => ({ ...p, slug: e.target.value }))} />
            </Col>
            <Col md={12}>
              <Form.Label className="small">title</Form.Label>
              <Form.Control value={createForm.title} onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={doCreate} disabled={saving}>
            {saving ? <Spinner size="sm" /> : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>

      <MediaPickerModal
        show={!!pickerState}
        onHide={() => setPickerState(null)}
        onSelect={(mediaId) => {
          if (pickerState?.type === "cover") applyCoverMedia(pickerState.projectId, mediaId);
          else if (pickerState?.type === "gallery") applyGalleryMedia(pickerState.projectId, mediaId);
        }}
      />
    </div>
  );
}
