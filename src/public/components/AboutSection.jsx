import React from "react";
import { motion } from "framer-motion";

export default function AboutSection({ profile }) {
    return (
        <motion.div
            className="lofi-box h-100"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="lofi-heading" style={{ fontSize: 22 }}>
                    About
                </div>
                <div
                    style={{
                        width: 70,
                        height: 6,
                        borderRadius: 999,
                        background: "#DF8976",
                    }}
                />
            </div>
            <div style={{ whiteSpace: "pre-line", color: "#5D5452", lineHeight: 1.6 }}>
                {profile.about_md}
            </div>
        </motion.div>
    );
}
