import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";

const normalizeUrl = (url) => {
  const s = String(url || "").trim();
  if (!s) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(s)) return s;
  return `https://${s}`;
};

const pillStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid rgba(93,84,82,0.22)",
  background: "rgba(255,255,255,0.65)",
  color: "#5D5452",
  fontWeight: 600,
  textDecoration: "none",
  lineHeight: 1,
};

export default function ContactSection({ profile, links = [] }) {
  const activeLinks = useMemo(() => {
    return (links || [])
      .filter((x) => x?.is_active !== false)
      .filter((x) => String(x?.url || "").trim());
  }, [links]);

  const hasContacts =
    !!profile.email_public ||
    !!profile.phone_public ||
    !!profile.location ||
    !!profile.github_public ||
    activeLinks.length > 0;

  if (!hasContacts) return null;

  const githubUrl = normalizeUrl(profile.github_public);

  return (
    <motion.div
      className="lofi-box mt-4"
      id="contact"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="lofi-heading" style={{ fontSize: 22 }}>
          Contact
        </div>
        <div style={{ width: 70, height: 6, borderRadius: 999, background: "#4A4443" }} />
      </div>

      {/* Horizontal minimal row */}
      <div className="d-flex flex-wrap gap-2 align-items-center">
        {profile.email_public && (
          <a
            href={`mailto:${profile.email_public}`}
            style={pillStyle}
            title={profile.email_public}
          >
            <HiOutlineMail size={18} />
            <span className="text-truncate" style={{ maxWidth: 260 }}>
              Email
            </span>
          </a>
        )}

        {profile.phone_public && (
          <a
            href={`tel:${profile.phone_public}`}
            style={pillStyle}
            title={profile.phone_public}
          >
            <HiOutlinePhone size={18} />
            <span className="text-truncate" style={{ maxWidth: 200 }}>
              {profile.phone_public}
            </span>
          </a>
        )}

        {profile.location && (
          <span style={{ ...pillStyle, cursor: "default" }} title={profile.location}>
            <HiOutlineLocationMarker size={18} />
            <span className="text-truncate" style={{ maxWidth: 220 }}>
              {profile.location}
            </span>
          </span>
        )}

        {githubUrl && (
          <a href={githubUrl} target="_blank" rel="noreferrer" style={pillStyle}>
            <FaGithub size={18} />
            <span>GitHub</span>
          </a>
        )}

      </div>
    </motion.div>
  );
}