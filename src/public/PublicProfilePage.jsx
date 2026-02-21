import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate  } from "react-router-dom";
import { Spinner, Container, Card, Button, Row, Modal } from "react-bootstrap";
import { motion } from "framer-motion";
import { fetchPublicProfileFull } from "../services/publicApi";

import "./lofi.css";

// Components
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import ExperienceSection from "./components/ExperienceSection";
import ProjectsSection from "./components/ProjectsSection";
import SkillsSection from "./components/SkillsSection";
import EducationSection from "./components/EducationSection";
import CertificatesSection from "./components/CertificatesSection";
import ContactSection from "./components/ContactSection";

const OWNER_ID = "wernnwernn";

export default function PublicProfilePage({ isOwner = false }) {
  const params = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [showLoginNudge, setShowLoginNudge] = useState(false);
  const [showFabTip, setShowFabTip] = useState(false);
  const [isClickLoginNudge, setIsClickLoginNudge] = useState(false);

  const openLogin = () => {
    setShowLoginNudge(false);
    navigate("admin/login");
  };

  useEffect(() => {
    if (!isOwner) return;

    const dismissed = sessionStorage.getItem("dismiss_build_profile_tip") && Number(sessionStorage.getItem("dismiss_build_profile_tip")) >= 3;
    if (dismissed || isClickLoginNudge) return;

    const t1 = setTimeout(() => setShowFabTip(true), 5000);   // โผล่หลัง 3 วิ
    const t2 = setTimeout(() => setShowFabTip(false), 20000); // โชว์ 15 วิแล้วหายเอง

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOwner, isClickLoginNudge]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const id = isOwner && !params.id ? null : (params.id ?? OWNER_ID);
        const res = await fetchPublicProfileFull(id || OWNER_ID);
        if (!mounted) return;
        setData(res);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "ไม่พบโปรไฟล์นี้");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isOwner, params.id]);

  const profile = data?.profile || {};

  useEffect(() => {
    const name = data?.profile?.display_name?.trim();
    if (name) document.title = name;
  }, [data?.profile?.display_name]);

  const links = useMemo(() => {
    return (data?.links || [])
      .filter((x) => x?.is_active !== false)
      .filter((x) => String(x?.url || "").trim())
      .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
  }, [data]);

  const skills = useMemo(() => {
    return (data?.skills || [])
      .filter((x) => x?.is_active !== false)
      .filter((x) => String(x?.name || "").trim())
      .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
  }, [data]);

  const experiences = useMemo(() => {
    return (data?.experiences || [])
      .filter((x) => String(x?.title || "").trim() || String(x?.company_name || "").trim())
      .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
  }, [data]);

  const educations = useMemo(() => {
    return (data?.educations || [])
      .filter((x) => String(x?.school || "").trim())
      .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
  }, [data]);

  const certificates = useMemo(() => {
    return (data?.certificates || [])
      .filter((x) => String(x?.name || "").trim())
      .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
  }, [data]);

  const projects = useMemo(() => {
    return (data?.projects || []).filter((p) => String(p?.title || "").trim());
  }, [data]);

  const primaryLinks = links.slice(0, 3);

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

  // Conditionally render based on the presence of data AND the user's explicit preference
  const showHero = !!showContent.hero;
  const showAbout = !!showContent.about && !!String(profile.about_md || "").trim();
  const showProjects = !!showContent.projects && projects.length > 0;
  const showExperience = !!showContent.experience && experiences.length > 0;
  const showSkills = !!showContent.skills && skills.length > 0;
  const showEducation = !!showContent.education && educations.length > 0;
  const showCertificates = !!showContent.certificates && certificates.length > 0;
  const showContact = !!showContent.contact && (links.length > 0 || !!profile.email_public || !!profile.phone_public || !!profile.location || !!profile.github_public);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center text-center lofi-bg" style={{ minHeight: "100vh" }}>
        <Spinner animation="grow" style={{ color: "#DF8976" }} />
        <div className="mt-3 text-secondary">Loading Profile...</div>
      </div>
    );
  }

  if (error || !data || !profile?.is_published) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center text-center lofi-bg" style={{ minHeight: "100vh" }}>
        <Card className="lofi-box" style={{ maxWidth: 420 }}>
          <Card.Body>
            <h3 className="lofi-heading mb-2">Not Found</h3>
            <p className="text-secondary mb-4" style={{ color: "#5D5452" }}>
              {error || "This profile may be hidden or unpublished."}
            </p>
            <Button href="/" className="lofi-button-primary">Return Home</Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="lofi-bg">
      <Container style={{ maxWidth: 1120, paddingTop: 12 }} >
        {/* Sticky Nav */}
        <motion.div
          className="d-flex align-items-center justify-content-between mb-4 lofi-nav-bar"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
        <motion.div
          className="d-none d-md-block"
          style={{
            maxWidth: 360,
            fontWeight: 900,
            fontSize: "clamp(18px, 2.2vw, 26px)",

            lineHeight: 1.2,
            paddingTop: 2,
            paddingBottom: 2,
            display: "inline-block",

            letterSpacing: -0.4,
            fontFamily:
              '"ui-rounded", "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',

            backgroundImage:
              "linear-gradient(90deg, #DF8976 0%, #E59A88 45%, #F2B07A 80%, #DF8976 100%)",
            backgroundSize: "220% 100%",
            backgroundPosition: "0% 50%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
            transform: "translateZ(0)",
          }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{
            transition: { duration: 0.1 },
          }}
        >
          {profile.display_name || "Profile"}
        </motion.div>

        <motion.div
          className="d-flex gap-2 align-items-center flex-nowrap ps-1"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
          }}
          style={{
            overflowX: "auto",
            overflowY: "visible",
            paddingTop: 5,
            paddingBottom: 5,
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
        {[
          { id: "top", label: "Profile" },
          ...(showExperience ? [{ id: "experience", label: "Experience" }] : []),
          ...(showProjects ? [{ id: "projects", label: "Projects" }] : []),
          ...(showSkills ? [{ id: "skills", label: "Skills" }] : []),
          ...(showContact ? [{ id: "contact", label: "Contact" }] : []),
        ].map((x) => (
          <motion.a
            key={x.id}
            href={x.id === "top" ? "#" : `#${x.id}`}
            className={[
              "lofi-pill text-decoration-none",
              x.id === "contact" ? "d-none d-md-inline-flex" : "",
            ].join(" ")}
            variants={{
              hidden: { opacity: 0, y: -6, scale: 0.98 },
              show: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={{ y: -2, scale: 1.03, boxShadow: "0 2px 1px rgba(223, 137, 118, 0.65)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            style={{ whiteSpace: "nowrap", flex: "0 0 auto" }}
          >
            {x.label}
          </motion.a>
        ))}
          </motion.div>
        </motion.div>

        {/* Hero */}
        {showHero && (
          <HeroSection
            profile={profile}
            primaryLinks={primaryLinks}
            links={links}
            hasHeroContacts={hasHeroContacts}
          />
        )}

        {/* About + Experience Row */}
        {(showAbout || showExperience) && (
          <Row className="g-4 mb-4">
            {showAbout && (
              <div className={showExperience ? "col-12 col-lg-5" : "col-12"}>
                <AboutSection profile={profile} />
              </div>
            )}
            {showExperience && (
              <div className={showAbout ? "col-12 col-lg-7" : "col-12"}>
                <ExperienceSection experiences={experiences} />
              </div>
            )}
          </Row>
        )}

        {/* Projects */}
        {showProjects && <ProjectsSection projects={projects} />}

        {/* Skills + Edu + Certs Row */}
        {(showSkills || showEducation || showCertificates) && (
          <Row className="g-4 mb-4 mt-2">
            {showSkills && <SkillsSection skills={skills} showEducation={showEducation} showCertificates={showCertificates} />}
            {(showEducation || showCertificates) && (
              <div className="col-12 col-lg-6 d-flex flex-column gap-4">
                {showEducation && <EducationSection educations={educations} />}
                {showCertificates && <CertificatesSection certificates={certificates} />}
              </div>
            )}
          </Row>
        )}

        {/* Contact Final Box */}
        {showContact && <ContactSection profile={profile} links={links} />}
      </Container>


      {isOwner && (
        <>
          {/* Floating icon */}
          <motion.button
            type="button"
            className="owner-login-fab"
            onClick={() =>{ 
                setShowLoginNudge(true);
                setShowFabTip(false);
                setIsClickLoginNudge(true);
              }}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            aria-label="Build your profile"
            title="Build your profile"
          >
            <span className="owner-login-fab-dot" />
            <span className="owner-login-fab-icon">✨</span>
          </motion.button>

          {/* Small modal */}
          <Modal
            show={showLoginNudge}
            onHide={() => setShowLoginNudge(false)}
            centered
            size="sm"
            contentClassName="owner-login-modal"
          >
            <Modal.Body className="p-4">
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div style={{ paddingRight: 6 }}>
                  <div
                    className="fw-bold lofi-heading"
                    style={{ fontSize: 17, lineHeight: 1.25 }}
                  >
                    Build your profile (DEMO)
                  </div>
                  <div
                    className="text-secondary mt-2"
                    style={{ fontSize: 13.5, lineHeight: 1.5, color: "#5D5452" }}
                  >
                    Log in to edit, update, and publish your profile. 
                  </div>
                </div>

                <Button
                  variant="light"
                  onClick={() => setShowLoginNudge(false)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    padding: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Close"
                >
                  ✕
                </Button>
              </div>

              <div className="d-flex gap-2 mt-4 flex-wrap">
                <Button
                  className="lofi-button-primary flex-fill"
                  style={{ minWidth: 140, borderRadius: 999, padding: "8px 12px" }}
                  size="sm"
                  onClick={openLogin}
                >
                  Go to Login
                </Button>

                <Button
                  variant="outline-dark"
                  size="sm"
                  className="flex-fill"
                  style={{ minWidth: 120, borderRadius: 999, padding: "8px 12px" }}
                  onClick={() => setShowLoginNudge(false)}
                >
                  Later
                </Button>
              </div>
            </Modal.Body>
          </Modal>
        </>
      )}

      {showFabTip && (
        <motion.div
          className="owner-fab-tip"
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          onClick={() => {
            setShowFabTip(false);
            const existing = sessionStorage.getItem("dismiss_build_profile_tip");
            sessionStorage.setItem("dismiss_build_profile_tip", existing ? String(Number(existing) + 1) : "1");
          }}
        >

          <div className="owner-fab-tip-title">Let’s build profile</div>
          <div className="owner-fab-tip-sub">Log in to edit demo profile.</div>
        </motion.div>
      )}
    </div>
  );
}
