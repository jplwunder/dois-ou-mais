import React, { useState } from "react";
// Assumindo que você utilize componentes de UI similares aos do projeto (shadcn/tailwind)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner"; // Ou o seu componente de loading
import { Modal } from "@/components/ui/modal"; // Se você tiver um componente de modal

export default function PersonalSettings({ currentUser, onUpdateUser, onBack, api }) {
  // Estados para dados de perfil (E-mail / Nome)
  const [email, setEmail] = useState(currentUser?.email || "");
  const [name, setName] = useState(currentUser?.name || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  // Estados para alteração de senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("profile");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  // Handler para atualizar dados básicos (ex: e-mail e nome)
  async function handleUpdateProfile(e) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: "", text: "" });

    try {
      // Substitua pela chamada real da sua API (ex: usando a função api() compartilhada)
      const response = await api("/users/me", {
        method: "PUT",
        body: JSON.stringify({ name, email }),
      });

      setProfileMessage({ type: "success", text: "Informações atualizadas com sucesso!" });
      if (onUpdateUser) onUpdateUser(response);
    } catch (err) {
      setProfileMessage({ type: "error", text: err.message || "Erro ao atualizar informações." });
    } finally {
      setProfileLoading(false);
    }
  }

  // Handler para alterar a senha
  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "As senhas novas não coincidem." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "A nova senha deve ter pelo menos 6 caracteres." });
      return;
    }

    setPasswordLoading(true);

    try {
      await api("/users/me/password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      setPasswordMessage({ type: "success", text: "Senha alterada com sucesso!" });
      // Limpa os campos de senha
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMessage({ type: "error", text: err.message || "Erro ao alterar a senha." });
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6 bg-card border border-border shadow-sm">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Informações Pessoais</h2>
        <p className="text-sm text-muted-foreground">Gerencie seus dados de acesso, e-mail e segurança da conta.</p>
      </div>

      <hr className="border-border" />

      {/* Seção de Dados Básicos (Nome e E-mail) */}
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <h3 className="text-md font-semibold text-foreground">Detalhes da Conta</h3>
        
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {profileMessage.text && (
          <p className={`text-xs font-medium ${profileMessage.type === "error" ? "text-destructive" : "text-emerald-600"}`}>
            {profileMessage.text}
          </p>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} disabled={passwordLoading}>
              Voltar
          </Button>
          <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                  onClick={() => { setError(""); setMode("auth"); }}
                >
                  Esqueceu sua senha?
                </button>
          </div>
          <Button type="submit" disabled={profileLoading}>
            {profileLoading ? <Spinner /> : "Salvar Alterações"}
          </Button>
        </div>
      </form>

    </div>
  );
}