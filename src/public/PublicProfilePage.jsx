import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner, Container, Card, Button, Row } from "react-bootstrap";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

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
  const showContact = !!showContent.contact;

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
          <div className="fw-bold lofi-heading text-truncate" style={{ maxWidth: 220, fontSize: 18 }}>
            {profile.display_name || "Profile"}
          </div>

          <div className="d-flex gap-2 align-items-center">
            <div className="d-none d-md-flex gap-2">
              {
                [{ id: "top", label: "Profile" }]
                  .concat(showExperience ? [{ id: "experience", label: "Experience" }] : [])
                  .concat(showProjects ? [{ id: "projects", label: "Projects" }] : [])
                  .concat(showSkills ? [{ id: "skills", label: "Skills" }] : [])
                  .concat(showContact ? [{ id: "contact", label: "Contact" }] : [])
                  .map((x) => (
                    <a key={x.id} href={x.id === "top" ? "#" : `#${x.id}`} className="lofi-pill text-decoration-none">
                      {x.label}
                    </a>
                  ))}
            </div>
          </div>
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
    </div>
  );
}
