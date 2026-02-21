import React from "react";
import { motion } from "framer-motion";

const clip = (v, n = 220) => {
    const s = String(v || "").trim();
    if (!s) return "";
    return s.length > n ? `${s.slice(0, n)}...` : s;
};

const formatDate = (v) => {
    if (!v) return "";
    try {
        const d = new Date(v);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
    } catch {
        return String(v);
    }
};

export default function EducationSection({ educations }) {
    return (
        <motion.div
            className="lofi-box mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="lofi-heading" style={{ fontSize: 18 }}>
                    Education
                </div>
                <div
                    style={{
                        width: 70,
                        height: 6,
                        borderRadius: 999,
                        background: "#4A4443",
                    }}
                />
            </div>

            <div className="d-flex flex-column gap-3 mt-3">
                {educations.map((ed, idx) => (
                    <motion.div
                        key={ed.id}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        style={{
                            paddingBottom: 16,
                            borderBottom: idx !== educations.length - 1 ? "1px dashed #EBE3DF" : "none"
                        }}
                    >
                        <div className="fw-bold" style={{ color: "#332E2C", fontSize: 16 }}>{ed.school}</div>
                        {(ed.degree || ed.field) ? (
                            <div className="text-secondary small mt-1" style={{ color: "#5D5452" }}>
                                {[ed.degree, ed.field].filter(Boolean).join(" · ")}
                            </div>
                        ) : null}
                        {(ed.start_date || ed.end_date) ? (
                            <div className="text-secondary small" style={{ color: "#8E8886" }}>
                                {formatDate(ed.start_date)} – {formatDate(ed.end_date) || "Present"}
                            </div>
                        ) : null}
                        {ed.description_md ? (
                            <div className="mt-2" style={{ whiteSpace: "pre-line", color: "#5D5452", fontSize: 13 }}>
                                {clip(ed.description_md, 180)}
                            </div>
                        ) : null}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
