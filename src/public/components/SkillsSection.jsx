import React from "react";
import { Col } from "react-bootstrap";
import { motion } from "framer-motion";

export default function SkillsSection({ skills, showCertificates, showEducation }) {

    const groupedSkills = skills.reduce((acc, skill) => {
        const cat = skill.category || 'Other';
        if (!acc[cat]) {
            acc[cat] = [];
        }
        acc[cat].push(skill);
        return acc;
    }, {});

    return (
        <Col xs={12} lg={12 - (showEducation || showCertificates ? 6 : 0)}>
            <motion.div
                className="lofi-box h-100"
                id="skills"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="lofi-heading" style={{ fontSize: 18 }}>
                        Skills
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

                <div className="d-flex flex-column gap-4">
                    {Object.entries(groupedSkills).map(([category, items], groupIndex) => (
                        <div key={category} className="skill-group">
                            {/* หัวข้อย่อย (Category Name) */}
                            <div 
                                className="mb-2 text-uppercase fw-bold" 
                                style={{ fontSize: '12px', letterSpacing: '1px', color: '#8E8886' }}
                            >
                                {category}
                            </div>

                            {/* รายการ Skill Pills ในกลุ่มนั้นๆ */}
                            <div className="d-flex flex-wrap gap-2">
                                {items.map((s, i) => (
                                    <motion.div
                                        key={s.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: (groupIndex * 0.1) + (i * 0.05) }}
                                        whileHover={{ y: -3, backgroundColor: "#EBE3DF" }}
                                        className="lofi-pill"
                                        style={{ padding: "6px 14px", fontSize: 13 }}
                                    >
                                        <span className="fw-semibold">
                                            {s.name}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </Col>
    );
}
