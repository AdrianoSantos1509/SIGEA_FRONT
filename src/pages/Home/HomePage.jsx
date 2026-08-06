import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  function handleLogout() {
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
        <h1 className="home-title">Bem-vindo(a) ao SIGEA!</h1>
        <p className="home-subtitle">
          Você acessou com sucesso o Sistema Integrado de Gestão de Espaços Acadêmicos.
        </p>
      </main>
    </div>
  );
}
