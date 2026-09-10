import React, { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Alert } from "../components/ui/alert";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Spinner } from "../components/ui/spinner";

export default function ResetPassword({ api, token, onDone }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");

    if (!token) {
      setError("O link de redefinição é inválido ou está incompleto.");
      return;
    }
    if (newPassword.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await api("/auth/reset_password", {
        method: "POST",
        body: { token: token.trim(), new_password: newPassword },
      });
      onDone();
    } catch (e) {
      setError(e.message || "Link inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <Card className="p-6 shadow-md bg-card">
          <h2 className="mb-1 text-lg font-semibold text-foreground">Nova senha</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Escolha uma nova senha para sua conta.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">Nova senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="new-password"
                  type="password"
                  className="pl-9"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  className="pl-9"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
            </div>

            {error && <Alert tone="error">{error}</Alert>}

            <Button className="w-full mt-2" onClick={handleSubmit} disabled={loading}>
              {loading && <Spinner />}
              Redefinir senha
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}