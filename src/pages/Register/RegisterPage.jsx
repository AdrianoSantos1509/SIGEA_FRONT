import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoSigea from "../../assets/images/logo-sigea.png";
import { authService, ApiError } from "../../services/api.js";
import "./RegisterPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  function validar() {
    if (!name.trim() || !email.trim() || !regNumber || !senha || !confirmarSenha) {
      return "Preencha todos os campos para continuar.";
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return "Informe um e-mail válido.";
    }
    if (!/^\d+$/.test(String(regNumber).trim())) {
      return "A matrícula deve conter apenas números.";
    }
    if (senha.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }
    if (senha !== confirmarSenha) {
      return "As senhas não coincidem.";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    const mensagemValidacao = validar();
    if (mensagemValidacao) {
      setErro(mensagemValidacao);
      return;
    }

    setEnviando(true);

    try {
      await authService.register({
        name: name.trim(),
        email: email.trim(),
        password: senha,
        reg_number: Number(regNumber),
      });

      setSucesso("Cadastro realizado com sucesso! Redirecionando para o login...");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      const mensagem =
        err instanceof ApiError
          ? err.message
          : "Não foi possível concluir o cadastro. Tente novamente.";
      setErro(mensagem);
      setEnviando(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Painel esquerdo */}
        <div className="register-left-panel">
          <div className="shape-circle-one" />
          <div className="shape-circle-two" />
          <div className="shape-stripe" />

          <div className="register-left-content">
            <img src={logoSigea} alt="SIGEA" className="register-logo" />
            <p className="register-tagline">
              Crie sua conta para planejar turmas, salas e horários em um só lugar.
            </p>
          </div>

          <div className="register-left-footer">
            <span className="register-left-footer-text">SIGEA © {new Date().getFullYear()}</span>
          </div>
        </div>

        {/* Painel direito - formulário */}
        <div className="register-right-panel">
          <div className="register-form-wrapper">
            <h1 className="register-title">Criar conta</h1>
            <p className="register-subtitle">
              Preencha seus dados para acessar o sistema.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <label className="register-label" htmlFor="name">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="register-input"
                disabled={enviando}
              />

              <label className="register-label register-label-spaced" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu.nome@instituicao.edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="register-input"
                disabled={enviando}
              />

              <label className="register-label register-label-spaced" htmlFor="regNumber">
                Matrícula
              </label>
              <input
                id="regNumber"
                type="text"
                inputMode="numeric"
                placeholder="Número de matrícula"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                className="register-input"
                disabled={enviando}
              />

              <div className="register-row-two-cols">
                <div className="register-col">
                  <label className="register-label register-label-spaced" htmlFor="senha">
                    Senha
                  </label>
                  <div className="register-password-wrapper">
                    <input
                      id="senha"
                      type={mostrarSenha ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="register-input register-input-password"
                      disabled={enviando}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha((v) => !v)}
                      className="register-toggle-password"
                      aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                      disabled={enviando}
                    >
                      {mostrarSenha ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>

                <div className="register-col">
                  <label
                    className="register-label register-label-spaced"
                    htmlFor="confirmarSenha"
                  >
                    Confirmar senha
                  </label>
                  <div className="register-password-wrapper">
                    <input
                      id="confirmarSenha"
                      type={mostrarConfirmarSenha ? "text" : "password"}
                      placeholder="Repita a senha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="register-input register-input-password"
                      disabled={enviando}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmarSenha((v) => !v)}
                      className="register-toggle-password"
                      aria-label={
                        mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"
                      }
                      disabled={enviando}
                    >
                      {mostrarConfirmarSenha ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>
              </div>

              {erro && <div className="register-error-box">{erro}</div>}
              {sucesso && <div className="register-success-box">{sucesso}</div>}

              <button
                type="submit"
                disabled={enviando || !!sucesso}
                className={`register-button ${
                  enviando || sucesso ? "register-button-disabled" : ""
                }`}
              >
                {sucesso ? "Conta criada!" : enviando ? "Cadastrando..." : "Cadastrar"}
              </button>
            </form>

            <p className="register-footer-note">
              Já tem uma conta?{" "}
              <Link to="/" className="register-link">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
