import React, { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Alert } from "../components/ui/alert";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Spinner } from "../components/ui/spinner";

export default function ForgotPassword({ api, onDone, onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      await api("/auth/forgot-password", { method: "POST", body: { email } });
      onDone();
    } catch (e) {
      // Still avoid confirming/denying account existence in the message
      setError(e.message || "Não foi possível enviar o e-mail. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <Card className="p-6 shadow-md bg-card">
          <h2 className="mb-1 text-lg font-semibold text-foreground">Redefinir senha</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Digite seu e-mail e enviaremos um link para redefinir sua senha.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="forgot-email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  className="pl-9"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
            </div>

            {error && <Alert tone="error">{error}</Alert>}

            <Button className="w-full mt-2" onClick={handleSubmit} disabled={loading || !email}>
              {loading && <Spinner />}
              Enviar link de redefinição
            </Button>
            <Button variant="outline" className="w-full" onClick={onBack} disabled={loading}>
              Voltar para login
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}