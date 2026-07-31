import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const user =
    location.state?.user ??
    JSON.parse(sessionStorage.getItem("sigea:user") || "null");

  function handleLogout() {
    sessionStorage.removeItem("sigea:user");
    navigate("/");
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <span className="home-brand">SIGEA</span>
        <button className="home-logout-button" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <main className="home-content">
        <h1 className="home-title">
          Bem-vindo(a){user?.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="home-subtitle">
          Você acessou com sucesso o Sistema Integrado de Gestão de Espaços Acadêmicos.
        </p>
      </main>
    </div>
  );
}
