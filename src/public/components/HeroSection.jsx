import React from "react";
import { Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { mediaUrl } from "../../services/cms/mediaApi";

const clip = (v, n = 220) => {
    const s = String(v || "").trim();
    if (!s) return "";
    return s.length > n ? `${s.slice(0, n)}...` : s;
};

export default function HeroSection({ profile, primaryLinks, links }) {
    const avatarSrc = profile.avatar_media_id ? mediaUrl(profile.avatar_media_id) : "";

    // Parse show_content configuration
    let showContent = {
        hero: true, about: true, experience: true, projects: true,
        skills: true, education: true, certificates: true, contact: true
    };

    if (profile.show_content) {
        try {
        const parsed = typeof profile.show_content === 'string' ? JSON.parse(profile.show_content) : profile.show_content;
        showContent = { ...showContent, ...parsed };
        } catch (e) {
        console.error("Failed to parse show_content", e);
        }
    }

    const hasHeroContacts = !!profile.location || !!profile.email_public || !!profile.phone_public;

    const showContact = !!showContent.contact && hasHeroContacts;

    return (
        <motion.section
            className="mb-4 lofi-box"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
        >
            <Row className="g-4 align-items-center">
                <Col xs={12} md="auto" className="text-center text-md-start">
                    <motion.div
                        whileHover={{ rotate: 5, scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        style={{
                            width: "clamp(140px, 20vw, 200px)",
                            height: "clamp(140px, 20vw, 200px)",
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "4px solid #DF8976",
                            boxShadow: "4px 6px 0px rgba(214, 198, 188, 0.5)",
                        }}
                        className="mx-auto"
                    >
                        {avatarSrc ? (
                            <img
                                src={avatarSrc}
                                alt={profile.display_name || "avatar"}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <div
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    fontSize: 44,
                                    fontWeight: 900,
                                    background: "#DF8976",
                                    color: "#fff",
                                }}
                            >
                                {(profile.display_name || profile.slug || "?")
                                    .slice(0, 1)
                                    .toUpperCase()}
                            </div>
                        )}
                    </motion.div>
                </Col>

                <Col xs={12} md className="text-center text-md-start">
                    <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2 align-items-center mb-3">
                        {profile.headline && (
                            <span className="lofi-pill" style={{ fontWeight: 700 }}>
                                {profile.headline}
                            </span>
                        )}
                    </div>

                    <div className="text-uppercase" style={{ fontSize: 12, letterSpacing: 2.2, color: "#8E8886" }}>
                        {profile.tagline || ""}
                    </div>

                    <h1
                        className="mt-1 mb-2 lofi-heading"
                        style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                    >
                        Hello, I&apos;m{" "}
                        <motion.span
                            style={{
                                fontWeight: 900,
                                lineHeight: 1.15,
                                paddingTop: 2,
                                paddingBottom: 6,
                                display: "inline-block",

                                backgroundImage:
                                    "linear-gradient(90deg, #DF8976 0%, #E59A88 45%, #F2B07A 80%, #DF8976 100%)",
                                backgroundSize: "220% 100%",
                                backgroundPosition: "0% 50%",

                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                color: "transparent",
                                WebkitTextFillColor: "transparent",

                                willChange: "background-position",
                                transform: "translateZ(0)", // กันขอบตัวอักษรถูกตัดบางเครื่อง
                            }}
                            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        >
                            {profile.display_name || ""}
                        </motion.span>
                    </h1>

                    {profile.about_md && (
                        <div className="mb-4 mx-auto mx-md-0" style={{ color: "#5D5452", maxWidth: 760, whiteSpace: "pre-line" }}>
                            {clip(profile.about_md, 260)}
                        </div>
                    )}



                    <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-3">
                        {profile.resume_media_id && (
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="lofi-button-primary"
                                href={mediaUrl(profile.resume_media_id)}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Resume
                            </motion.a>
                        )}

                        {showContact  && (
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href="#contact"
                                className="lofi-button-outline"
                            >
                                View Contacts
                            </motion.a>
                        )}
                    </div>
                </Col>
            </Row>
        </motion.section>
    );
}
