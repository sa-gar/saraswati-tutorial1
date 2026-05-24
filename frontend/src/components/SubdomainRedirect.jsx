import { Navigate } from "react-router-dom";

export default function SubdomainRedirect() {
  const host = window.location.hostname;

  if (host.startsWith("mumbai.")) {
    return <Navigate to="/mumbai" replace />;
  }

  return null;
}