import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineExternalLink } from "react-icons/hi";
import {
  FaGithub,
  FaLinkedin,
  FaFacebook,
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaGlobe,
} from "react-icons/fa";

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

const getGithubUsername = (inputUrl) => {
  const raw = String(inputUrl || "").trim();
  if (!raw) return "";

  let u = raw;

  if (/^git@github\.com:/i.test(u)) {
    u = u.replace(/^git@github\.com:/i, "https://github.com/");
  }

  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;

  try {
    const url = new URL(u);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();

    if (host.endsWith("github.io")) {
      const sub = host.split(".")[0];
      return sub && sub !== "www" ? sub : "";
    }

    if (host === "github.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      const username = parts[0] || "";
      if (["features", "topics", "collections", "pricing", "login", "signup", "about"].includes(username.toLowerCase())) {
        return "";
      }
      return username;
    }

    return "";
  } catch {
    return "";
  }
};

const getLinkMeta = (inputUrl = "", label = "") => {
  const urlStr = normalizeUrl(inputUrl);
  const labelStr = String(label || "").toLowerCase();

  let host = "";
  try {
    host = new URL(urlStr).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    host = "";
  }

  const hay = `${host} ${labelStr}`;

  const has = (...keys) => keys.some((k) => hay.includes(k));

  if (has("github.com", "github", "gh")) return { Icon: FaGithub, text: "GitHub" };
  if (has("linkedin.com", "linkedin")) return { Icon: FaLinkedin, text: "LinkedIn" };
  if (has("facebook.com", "fb.com", "facebook")) return { Icon: FaFacebook, text: "Facebook" };
  if (has("youtube.com", "youtu.be", "youtube")) return { Icon: FaYoutube, text: "YouTube" };
  if (has("instagram.com", "instagram")) return { Icon: FaInstagram, text: "Instagram" };
  if (has("tiktok.com", "tiktok")) return { Icon: FaTiktok, text: "TikTok" };
  if (has("x.com", "twitter.com", "twitter")) return { Icon: FaTwitter, text: "X / Twitter" };

  if (host) return { Icon: FaGlobe, text: host };
  return { Icon: HiOutlineExternalLink, text: "Link" };
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

    const rowVariants = {
        hidden: {},
        show: {
            transition: { staggerChildren: 0.06, delayChildren: 0.05 },
        },
    };

    const pillVariants = {
        hidden: { opacity: 0, y: 10, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1 },
    };

    const pillMotionAProps = {
        variants: pillVariants,
        whileHover: { y: -2, scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { type: "spring", stiffness: 420, damping: 28 },
        style: { ...pillStyle, willChange: "transform" },
    };

    const pillMotionSpanProps = {
        variants: pillVariants,
        whileHover: { y: -2, scale: 1.02 },
        transition: { type: "spring", stiffness: 420, damping: 28 },
        style: { ...pillStyle, cursor: "default", willChange: "transform" },
    };

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
        <motion.div
            className="d-flex flex-wrap gap-2 align-items-center"
            variants={rowVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
        >
        {profile.email_public && (
            <motion.a
                href={`mailto:${profile.email_public}`}
                title={profile.email_public}
                {...pillMotionAProps}
            >
                <HiOutlineMail size={18} />
                <span className="text-truncate p-1" style={{ maxWidth: 260 }}>
                    {profile.email_public}
                </span>
            </motion.a>
        )}

        {profile.phone_public && (
            <motion.a
                href={`tel:${profile.phone_public}`}
                title={profile.phone_public}
                {...pillMotionAProps}
            >
                <HiOutlinePhone size={18} />
                <span className="text-truncate p-1" style={{ maxWidth: 200 }}>
                    {profile.phone_public}
                </span>
            </motion.a>
        )}

        {githubUrl && (
            <motion.a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                title={githubUrl}
                {...pillMotionAProps}
            >
                <FaGithub size={18} />
                <span className="text-truncate p-1">{getGithubUsername(githubUrl)}</span>
            </motion.a>
        )}

        {activeLinks.map((link) => {
            const href = normalizeUrl(link.url);
            const { Icon, text } = getLinkMeta(link.url, link.label);

            return (
            <motion.a
                key={link.id}
                href={href}
                target="_blank"
                rel="noreferrer"
                title={href}
                {...pillMotionAProps}
            >
                <Icon size={18} />
                <span className="text-truncate p-1" style={{ maxWidth: 260 }}>
                    {link.label || text}
                </span>
            </motion.a>
            );
        })}

        {profile.location && (
            <motion.span title={profile.location} {...pillMotionSpanProps}>
                <HiOutlineLocationMarker size={18} />
                <span className="text-truncate p-1" style={{ maxWidth: 220 }}>
                    {profile.location}
                </span>
            </motion.span>
        )}
        </motion.div>
    </motion.div>
  );
}