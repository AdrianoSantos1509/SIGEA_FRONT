import React, { useState } from "react";
import logoSigea from "../../assets/images/logo-sigea.png";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Informe e-mail e senha para continuar.");
      return;
    }

    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
    }, 1200);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Painel esquerdo */}
        <div className="login-left-panel">
          <div className="shape-circle-one" />
          <div className="shape-circle-two" />
          <div className="shape-stripe" />

          <div className="login-left-content">
            <img src={logoSigea} alt="SIGEA" className="login-logo" />
          </div>

          <div className="login-left-footer">
            <span className="login-left-footer-text">
              SIGEA © {new Date().getFullYear()}
            </span>
          </div>
        </div>

        {/* Painel direito - formulário */}
        <div className="login-right-panel">
          <div className="login-form-wrapper">
            <h1 className="login-title">Bem-vindo de volta</h1>
            <p className="login-subtitle">
              Entre com suas credenciais para acessar o sistema.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <label className="login-label" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu.nome@instituicao.edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
              />

              <label className="login-label login-label-spaced" htmlFor="senha">
                Senha
              </label>
              <div className="login-password-wrapper">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="login-input login-input-password"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="login-toggle-password"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? "Ocultar" : "Mostrar"}
                </button>
              </div>

              {erro && <div className="login-error-box">{erro}</div>}

              <div className="login-row-between">
                <button
                  type="submit"
                  disabled={enviando}
                  className={`login-button ${
                    enviando ? "login-button-disabled" : ""
                  }`}
                >
                  {enviando ? "Entrando..." : "Entrar"}
                </button>
              </div>
            </form>            
          </div>
        </div>
      </div>
    </div>
  );
}
