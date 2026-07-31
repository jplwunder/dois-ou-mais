import React, { useState, useRef, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert } from "../components/ui/alert";
import { ShieldCheck, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function AccountVerification({ email, api, onVerified, onBackToLogin }) {
  const CODE_LENGTH = 6;
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Referência para focar nos inputs individuais
  const inputRefs = useRef([]);

  // Foca no primeiro input assim que a tela carrega
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Timer regressivo para o botão de reenvio
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Manipula a digitação de cada dígito
  const handleChange = (index, value) => {
    // Permite apenas números
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newCode.join("");
    if (fullCode.length === CODE_LENGTH) {
      verifyCode(fullCode);
    }
  };

  // Manipula teclas especiais (Backspace para voltar campo)
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Suporte a colar o código completo (Ctrl+V / Cmd+V)
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Filtra apenas números e limita aos 6 dígitos
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.slice(0, CODE_LENGTH).split("");
      const newCode = [...code];

      digits.forEach((digit, idx) => {
        newCode[idx] = digit;
        if (inputRefs.current[idx]) {
          inputRefs.current[idx].value = digit;
        }
      });

      setCode(newCode);

      // Foca no último input preenchido ou no próximo vazio
      const focusIndex = Math.min(digits.length, CODE_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();

      // Se colou o código completo, verifica automaticamente
      if (digits.length === CODE_LENGTH) {
        verifyCode(digits.join(""));
      }
    }
  };

  // Envio do código para a API
  const verifyCode = async (submittedCode) => {
    setLoading(true);
    setError("");

    try {
      // Ajuste o endpoint conforme a especificação da sua API
      await api(`auth/verify-code`, {
        method: "POST",
        body: {
          email: email,
          code: submittedCode,
        },
      });

      setSuccess(true);

      setTimeout(() => {
        if (onVerified) onVerified();
      }, 2000);
    } catch (err) {
      setError(err.message || "Código inválido ou expirado. Tente novamente.");
      // Limpa os campos para nova tentativa
      setCode(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Reenvio do código de verificação
  const handleResendCode = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setError("");

    try {
      await api("/auth/send_verification_code", {
        method: "POST",
        body: { email: email },
      });

      setResendCooldown(60); // 60 segundos de espera
    } catch (err) {
      setError(err.message || "Não foi possível reenviar o código. Tente mais tarde.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        {/* Cabeçalho */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Verifique sua conta</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Enviamos um código de 6 dígitos para{" "}
            <strong className="text-foreground">{email || "seu e-mail"}</strong>
          </p>
        </div>

        {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}

        {success ? (
          <Card className="p-6 text-center shadow-md border-emerald-500/30 bg-emerald-500/5 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-foreground">Conta verificada com sucesso!</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Redirecionando você para o sistema...
            </p>
          </Card>
        ) : (
          <Card className="p-6 shadow-md bg-card">
            {/* Inputs de Código */}
            <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  className="h-12 w-12 rounded-lg border border-input bg-background text-center text-lg font-bold text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
              ))}
            </div>

            {/* Botão de Confirmação Manual */}
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={() => verifyCode(code.join(""))}
              disabled={loading || code.join("").length !== CODE_LENGTH}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Verificar Código
            </Button>

            {/* Reenvio do Código */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              Não recebeu o código?{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || resending}
                className="font-semibold text-primary underline-offset-4 hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {resendCooldown > 0
                  ? `Reenviar em ${resendCooldown}s`
                  : resending
                  ? "Enviando..."
                  : "Reenviar código"}
              </button>
            </div>

            {/* Opção para voltar/trocar conta */}
            {onBackToLogin && (
              <div className="mt-4 pt-4 border-t border-border/60 text-center">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o Login
                </button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}