import React, { useState } from "react";
import { CalendarPlus, Lock, Mail, User as UserIcon } from "lucide-react";
import { Alert, Button, Card, Input, Label, Spinner } from "../components/ui";

// ---------------------------------------------------------------------------
// Tela de Autenticação (Login / Registro)
// ---------------------------------------------------------------------------

export default function AuthScreen({ api, onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", age: "" });

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const tokenData = await api("/login", {
        form: true,
        method: "POST",
        body: { username: loginForm.email, password: loginForm.password },
      });
      const me = await api("/me", { token: tokenData.access_token });
      onAuthenticated(tokenData.access_token, me);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      };
      if (registerForm.age) payload.age = Number(registerForm.age);
      await api("/users", { method: "POST", body: payload });
      setNotice("Conta criada com sucesso! Faça login abaixo.");
      setLoginForm({ email: registerForm.email, password: "" });
      setRegisterForm({ name: "", email: "", password: "", age: "" });
      setMode("login");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit() {
    setNotice("");
    if (mode === "login") handleLogin();
    else handleRegister();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <CalendarPlus className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Sistema de Eventos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Gerencie ou participe de eventos organizados" : "Cadastre-se para começar"}
          </p>
        </div>

        <Card className="p-6 shadow-md bg-card">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`rounded-md py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                mode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`rounded-md py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                mode === "register" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Cadastrar
            </button>
          </div>

          <div className="space-y-4">
            {mode === "register" && (
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    className="pl-9"
                    placeholder="João da Silva"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9"
                  placeholder="exemplo@email.com"
                  value={mode === "login" ? loginForm.email : registerForm.email}
                  onChange={(e) =>
                    mode === "login"
                      ? setLoginForm({ ...loginForm, email: e.target.value })
                      : setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  placeholder="••••••••"
                  value={mode === "login" ? loginForm.password : registerForm.password}
                  onChange={(e) =>
                    mode === "login"
                      ? setLoginForm({ ...loginForm, password: e.target.value })
                      : setRegisterForm({ ...registerForm, password: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
            </div>

            {mode === "register" && (
              <div>
                <Label htmlFor="age">Idade (opcional)</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  placeholder="Ex: 25"
                  value={registerForm.age}
                  onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })}
                />
              </div>
            )}

            {error && <Alert tone="error">{error}</Alert>}
            {notice && <Alert tone="success">{notice}</Alert>}

            <Button className="w-full mt-2" onClick={handleSubmit} disabled={loading}>
              {loading && <Spinner />}
              {mode === "login" ? "Entrar na conta" : "Criar minha conta"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

