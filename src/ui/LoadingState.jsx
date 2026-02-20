import React from "react";
import { Spinner } from "react-bootstrap";

export default function LoadingState({ message = "กำลังโหลด...", fullHeight = false }) {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center"
      style={fullHeight ? { minHeight: "50vh" } : undefined}
    >
      <Spinner animation="border" />
      {message ? <div className="mt-3 text-secondary">{message}</div> : null}
    </div>
  );
}

