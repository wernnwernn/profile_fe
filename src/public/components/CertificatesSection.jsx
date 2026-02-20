import React from "react";
import { motion } from "framer-motion";

const formatDate = (v) => {
    if (!v) return "";
    try {
        const d = new Date(v);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
    } catch {
        return String(v);
    }
};

export default function CertificatesSection({ certificates }) {
    return (
        <motion.div
            className="lofi-box"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="lofi-heading" style={{ fontSize: 18 }}>
                    Certificates
                </div>
                <div
                    style={{
                        width: 70,
                        height: 6,
                        borderRadius: 999,
                        background: "#D6C6BC",
                    }}
                />
            </div>

            <div className="d-flex flex-column gap-3 mt-3">
                {certificates.map((c, idx) => (
                    <motion.div
                        key={c.id}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        style={{
                            paddingBottom: 16,
                            borderBottom: idx !== certificates.length - 1 ? "1px dashed #EBE3DF" : "none"
                        }}
                    >
                        <div className="d-flex justify-content-between gap-2">
                            <div style={{ minWidth: 0 }}>
                                <div className="fw-bold text-truncate" style={{ color: "#332E2C", fontSize: 15 }}>{c.name}</div>
                                {c.issuer ? <div className="text-secondary small mt-1" style={{ color: "#5D5452" }}>{c.issuer}</div> : null}
                            </div>
                            {c.issue_date ? (
                                <div className="text-secondary small" style={{ color: "#8E8886" }}>{formatDate(c.issue_date)}</div>
                            ) : null}
                        </div>

                        {c.credential_url ? (
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                className="lofi-button-outline mt-3 d-inline-block text-decoration-none"
                                style={{ fontSize: 12, padding: "4px 12px" }}
                                href={c.credential_url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                View Credential
                            </motion.a>
                        ) : null}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
