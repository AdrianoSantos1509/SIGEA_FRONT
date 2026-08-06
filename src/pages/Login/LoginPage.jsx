import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoSigea from "../../assets/images/logo-sigea.png";
import { FAKE_USER } from "../../data/fakeUser.js";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!email || !senha) {
      setErro("Informe e-mail e senha para continuar.");
      return;
    }

    setEnviando(true);

    // Simula a chamada de autenticação com o usuário fake de teste.
    setTimeout(() => {
      const credenciaisValidas =
        email.trim().toLowerCase() === FAKE_USER.email.toLowerCase() &&
        senha === FAKE_USER.senha;

      if (!credenciaisValidas) {
        setEnviando(false);
        setErro("E-mail ou senha incorretos. Tente novamente.");
        return;
      }

      // setSucesso("Login realizado com sucesso! Redirecionando...");

      setTimeout(() => {
        navigate("/home");
      }, 1200);
    }, 900);
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
            <p className="login-tagline">
              Gestão inteligente de espaços acadêmicos, do planejamento à sala de aula.
            </p>
          </div>

          <div className="login-left-footer">
            <span className="login-left-footer-text">SIGEA © {new Date().getFullYear()}</span>
          </div>
        </div>

        {/* Painel direito - formulário */}
        <div className="login-right-panel">
          <div className="login-form-wrapper">
            <h1 className="login-title">Bem-vindo de volta</h1>
            <p className="login-subtitle">Entre com suas credenciais para acessar o sistema.</p>

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
                disabled={enviando}
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
                  disabled={enviando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="login-toggle-password"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  disabled={enviando}
                >
                  {mostrarSenha ? "Ocultar" : "Mostrar"}
                </button>
              </div>

              {erro && <div className="login-error-box">{erro}</div>}
              {sucesso && <div className="login-success-box">{sucesso}</div>}

              <div className="login-row-between">
                <label className="login-checkbox-label">
                  <input
                    type="checkbox"
                    checked={lembrar}
                    onChange={(e) => setLembrar(e.target.checked)}
                    className="login-checkbox"
                  />
                  Lembrar de mim
                </label>
                <a href="#" className="login-link">
                  Esqueci minha senha
                </a>
              </div>

              <button
                type="submit"
                disabled={enviando || !!sucesso}
                className={`login-button ${enviando || sucesso ? "login-button-disabled" : ""}`}
              >
                {sucesso ? "Login realizado!" : enviando ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <p className="login-footer-note">
              Precisa de acesso?{" "}
              <a href="#" className="login-link">
                Fale com a coordenação
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
