import React from "react";
import { Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { mediaUrl } from "../../services/cms/mediaApi";

const clip = (v, n = 140) => {
    const s = String(v || "").trim();
    if (!s) return "";
    return s.length > n ? `${s.slice(0, n)}...` : s;
};

export default function ProjectsSection({ projects }) {
    return (
        <motion.section
            id="projects"
            className="mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <div className="text-center mb-4">
                <div className="lofi-heading" style={{ fontSize: "clamp(26px, 4vw, 36px)" }}>
                    Projects
                </div>
            </div>

            <Row className="g-4">
                {projects.map((p, idx) => {
                    const cover = p.cover_media_id ? mediaUrl(p.cover_media_id) : "";
                    const techs = Array.isArray(p.tech_stack_json) ? p.tech_stack_json : [];

                    return (
                        <Col xs={12} md={6} lg={4} key={p.id}>
                            <motion.div
                                className="lofi-box h-100 d-flex flex-column"
                                style={{ overflow: "hidden", padding: 0 }}
                                whileHover={{ x: 8, y: -4, boxShadow: "8px 12px 0px rgba(214, 198, 188, 0.5)" }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {cover ? (
                                    <div style={{ height: 180, overflow: "hidden", borderBottom: "1px solid #EBE3DF" }}>
                                        <motion.img
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 0.3 }}
                                            src={cover}
                                            alt={p.title}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ height: 180, background: "#F4EFEB", borderBottom: "1px solid #EBE3DF" }} className="d-flex align-items-center justify-content-center">
                                        <span style={{ color: "#D6C6BC", fontWeight: "bold" }}>No Image</span>
                                    </div>
                                )}

                                <div className="p-4 d-flex flex-column flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                                        <div className="lofi-heading" style={{ fontSize: 18 }}>
                                            {p.title}
                                        </div>
                                        {p.is_featured ? (
                                            <span className="lofi-pill" style={{ background: "#DF8976", color: "white", padding: "2px 8px", fontSize: 10, border: "none" }}>
                                                Featured
                                            </span>
                                        ) : null}
                                    </div>

                                    {p.summary ? (
                                        <div className="text-secondary mb-3 flex-grow-1" style={{ fontSize: 13, color: "#5D5452", lineHeight: 1.5 }}>
                                            {clip(p.summary, 120)}
                                        </div>
                                    ) : <div className="flex-grow-1" />}

                                    {(p.role || p.status) ? (
                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            {p.role ? <span className="lofi-pill" style={{ fontSize: 11, padding: "2px 8px" }}>{p.role}</span> : null}
                                            {p.status ? (
                                                <span className="lofi-pill" style={{ fontSize: 11, padding: "2px 8px", background: "#F4EFEB" }}>{p.status}</span>
                                            ) : null}
                                        </div>
                                    ) : null}

                                    {techs.length > 0 ? (
                                        <div className="d-flex flex-wrap gap-1 mb-3">
                                            {techs.slice(0, 4).map((t) => (
                                                <span key={t} className="lofi-pill" style={{ fontSize: 10, padding: "2px 6px", background: "white" }}>
                                                    {t}
                                                </span>
                                            ))}
                                            {techs.length > 4 && <span className="lofi-pill" style={{ fontSize: 10, padding: "2px 6px", background: "white" }}>+{techs.length - 4}</span>}
                                        </div>
                                    ) : null}

                                    {(p.demo_url || p.repo_url) ? (
                                        <div className="d-flex flex-wrap gap-2 mt-auto pt-2 border-top" style={{ borderColor: "#EBE3DF" }}>
                                            {p.demo_url ? (
                                                <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="lofi-button-primary flex-grow-1 text-center" style={{ fontSize: 13, padding: "6px 12px" }} href={p.demo_url} target="_blank" rel="noreferrer">
                                                    Live
                                                </motion.a>
                                            ) : null}
                                            {p.repo_url ? (
                                                <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="lofi-button-outline flex-grow-1 text-center" style={{ fontSize: 13, padding: "6px 12px" }} href={p.repo_url} target="_blank" rel="noreferrer">
                                                    Repo
                                                </motion.a>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </div>
                            </motion.div>
                        </Col>
                    );
                })}
            </Row>
        </motion.section>
    );
}
