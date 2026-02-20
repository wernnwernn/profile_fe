import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import { getErrMsg } from "../../services/api";
import { listMedia, mediaUrl } from "../../services/cms/mediaApi";
import { useNotify } from "../../ui/NotificationProvider";

export default function MediaPickerModal({ show, onHide, onSelect }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("");
    const notify = useNotify();

    const fetchItems = async (search = "") => {
        setLoading(true);
        try {
            const data = await listMedia({ q: search, limit: 100 });
            setItems(data);
        } catch (e) {
            notify.error(getErrMsg(e) || "โหลด media ไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            fetchItems(q);
        }
        // eslint-disable-next-line
    }, [show]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchItems(q);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>เลือก Media</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ minHeight: "400px" }}>
                <Form onSubmit={handleSearch} className="mb-3 d-flex gap-2">
                    <Form.Control
                        placeholder="ค้นหา (alt_text, id)..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <Button type="submit" variant="secondary" disabled={loading}>
                        ค้นหา
                    </Button>
                </Form>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-secondary text-center py-5">
                        ไม่พบ media ที่เคยอัปโหลดไว้ กรุณาอัปโหลดที่หน้า Media
                    </div>
                ) : (
                    <Row xs={2} md={3} lg={4} className="g-3">
                        {items.map((m) => {
                            const url = mediaUrl(m.id);
                            return (
                                <Col key={m.id}>
                                    <Card
                                        className="h-100 cursor-pointer shadow-sm border-0"
                                        style={{ cursor: "pointer", overflow: "hidden" }}
                                        onClick={() => {
                                            onSelect(m.id);
                                            onHide();
                                        }}
                                    >
                                        <div className="bg-body-tertiary" style={{ height: 120 }}>
                                            <img
                                                src={url}
                                                alt={m.alt_text || "media"}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        </div>
                                        <Card.Footer className="p-2 border-0 bg-light small text-truncate">
                                            ID: {m.id} <br />
                                            {m.alt_text || "ไม่มี alt_text"}
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>
                    ยกเลิก
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
