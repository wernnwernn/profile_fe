import React, { useMemo } from "react";
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

const toTime = (v) => {
    if (!v) return null;
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : null;
};

export default function ExperienceSection({ experiences }) {

    const sortedExperiences = useMemo(() => {
        const arr = Array.isArray(experiences) ? [...experiences] : [];

        arr.sort((a, b) => {
        const ta = toTime(a?.start_date);
        const tb = toTime(b?.start_date);

        if (ta === null && tb === null) return 0;
        if (ta === null) return 1;
        if (tb === null) return -1;

        return tb - ta; // desc
        });

        return arr;
    }, [experiences]);

    return (
        <motion.div
            className="lofi-box h-100" id="experience"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="lofi-heading" style={{ fontSize: 22 }}>
                    Experience
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

            <div className="d-flex flex-column gap-4 mt-4">
                {sortedExperiences.map((exp, idx) => {
                    const title = String(exp.title || "").trim();
                    const company = String(exp.company_name || "").trim();
                    const metaBits = [
                        exp.start_date ? formatDate(exp.start_date) : "",
                        exp.is_current ? "Present" : exp.end_date ? formatDate(exp.end_date) : "",
                        exp.location ? exp.location : "",
                        exp.employment_type ? exp.employment_type : "",
                    ].filter(Boolean);

                    return (
                        <motion.div
                        key={exp.id}
                        className="d-flex gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        >
                        {/* Left rail */}
                        <div style={{ width: 24, position: "relative", flex: "0 0 24px" }}>
                            {/* Dot */}
                            <div
                            style={{
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                position: "absolute",
                                left: "50%",
                                top: 6,
                                transform: "translateX(-50%)",
                                background: "#DF8976",
                                border: "2px solid #F9F7F5",
                                boxShadow: "0 0 0 2px #EBE3DF",
                                zIndex: 2,
                            }}
                            />
                            {/* Line */}
                            {idx !== sortedExperiences.length - 1 && (
                            <div
                                style={{
                                position: "absolute",
                                left: "50%",
                                top: 6 + 14,
                                transform: "translateX(-50%)",
                                height: "calc(100% - 6px - 14px + 1.5rem)",
                                borderLeft: "2px dashed #EBE3DF",
                                }}
                            />
                            )}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0, paddingBottom: idx !== sortedExperiences.length - 1 ? "1.5rem" : 0 }}>
                            <div className="d-flex flex-wrap gap-2 align-items-baseline">
                            {title && <div className="fw-bold" style={{ color: "#332E2C" }}>{title}</div>}
                            {company && (
                                <div className="text-secondary small text-truncate" style={{ maxWidth: "100%" }}>
                                · {company}
                                </div>
                            )}
                            {exp.is_current ? (
                                <span className="lofi-pill" style={{ background: "#E8F0E4", color: "#486B3E", padding: "2px 8px" }}>
                                Current
                                </span>
                            ) : null}
                            </div>

                            {metaBits.length > 0 && (
                            <div className="text-secondary small mt-1" style={{ color: "#8E8886" }}>
                                {metaBits.join(" · ")}
                            </div>
                            )}

                            {exp.description_md && (
                            <div className="mt-2" style={{ whiteSpace: "pre-line", color: "#5D5452", fontSize: "0.95rem" }}>
                                {clip(exp.description_md, 420)}
                            </div>
                            )}
                        </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
