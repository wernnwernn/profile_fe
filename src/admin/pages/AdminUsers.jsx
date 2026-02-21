import React, { useEffect, useState, useMemo } from "react";
import { Button, Card, Form, Spinner, Stack, Table, Modal, Badge } from "react-bootstrap";
import { getErrMsg } from "../../services/api";
import { listUsers, createUser, updateUser } from "../../services/cms/usersApi";
import { useNotify } from "../../ui/NotificationProvider";

export default function AdminUsers() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [items, setItems] = useState([]);
    const notify = useNotify();

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ id: null, email: "", username: "", password: "", role: "user", is_active: true });
    const [isEdit, setIsEdit] = useState(false);

    const fetchData = useMemo(() => async () => {
        setLoading(true);
        try {
            setItems(await listUsers());
        } catch (e) {
            notify.error(getErrMsg(e) || "โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [notify]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openAdd = () => {
        setForm({ id: null, email: "", username: "", password: "", role: "user", is_active: true });
        setIsEdit(false);
        setShowModal(true);
    };

    const openEdit = (row) => {
        setForm({ ...row, password: "" });
        setIsEdit(true);
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await updateUser(form.id, form);
                notify.success("บันทึกแล้ว");
            } else {
                await createUser(form);
                notify.success("เพิ่มแล้ว");
            }
            closeModal();
            fetchData();
        } catch (e) {
            notify.error(getErrMsg(e) || "บันทึกไม่สำเร็จ");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="py-3">
            <Stack direction="horizontal" className="mb-3" gap={2}>
                <h4 className="m-0">Users Management</h4>
                <div className="ms-auto" />
                <Button variant="primary" onClick={openAdd}>
                    Add User
                </Button>
            </Stack>
            <p className="text-danger">
                หน้านี้สำหรับผู้ดูแลระบบ จัดแสดงไว้เพื่อการสาธิตเท่านั้น(Demo) ไม่สามารถใช้งานได้ในสิทธิ์ของผู้ใช้งานทั่วไป
            </p>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner />
                </div>
            ) : (
                <Card>
                    <Table responsive hover className="m-0">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th width="120">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((row) => (
                                <tr key={row.id}>
                                    <td>{row.id}</td>
                                    <td>{row.username}</td>
                                    <td>{row.email}</td>
                                    <td>
                                        <Badge bg={row.role === 'admin' ? 'danger' : 'primary'}>{row.role}</Badge>
                                    </td>
                                    <td>
                                        {row.is_active ? <Badge bg="success">Active</Badge> : <Badge bg="secondary">Inactive</Badge>}
                                    </td>
                                    <td>{row.last_login_at ? new Date(row.last_login_at).toLocaleString('th-TH') : '-'}</td>
                                    <td>
                                        <Button size="sm" variant="outline-primary" onClick={() => openEdit(row)}>
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-3 text-muted">
                                        ไม่พบข้อมูลผู้ใช้งาน
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card>
            )}

            <Modal show={showModal} onHide={closeModal}>
                <Form onSubmit={handleSave}>
                    <Modal.Header closeButton>
                        <Modal.Title>{isEdit ? "Edit User" : "Add User"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                required
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password {isEdit && <small className="text-muted">(ปล่อยว่างหากไม่ต้องการเปลี่ยน)</small>}</Form.Label>
                            <Form.Control
                                type="password"
                                required={!isEdit}
                                minLength={6}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </Form.Select>
                        </Form.Group>
                        {isEdit && (
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    label="Active"
                                    checked={form.is_active}
                                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                />
                            </Form.Group>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={saving}>
                            {saving ? <Spinner size="sm" /> : "Save"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}
