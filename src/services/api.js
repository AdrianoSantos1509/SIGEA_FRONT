const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3300";

/**
 * Erro customizado para respostas não-OK da API,
 * carregando a mensagem retornada pelo backend.
 */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || "Não foi possível completar a solicitação.";
    throw new ApiError(message, response.status);
  }

  return data;
}

export const authService = {
  /**
   * Autentica o usuário no backend (POST /users/login).
   * Retorna os dados do usuário (sem a senha) em caso de sucesso.
   */
  login(email, password) {
    return request("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Cria um novo usuário (POST /users).
   */
  register({ name, email, password, reg_number }) {
    return request("/users", {
      method: "POST",
      body: JSON.stringify({ name, email, password, reg_number }),
    });
  },
};
