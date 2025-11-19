import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "login" | "register";
}

export function AuthModal({ open, onOpenChange, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "reset" | "verify">(defaultMode);
  const [, setLocation] = useLocation();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Verification state
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");

  // Reset state
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const loginMutation = trpc.auth.loginLocal.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      setLocation("/planner");
      window.location.reload(); // Reload to update auth state
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const registerMutation = trpc.auth.registerLocal.useMutation({
    onSuccess: (data) => {
      // Transition to verification mode
      setPendingUserId(data.userId);
      setPendingEmail(data.email);
      setMode("verify");
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const resetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setResetSent(true);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const verifyMutation = trpc.auth.verifyEmailCode.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      setLocation("/planner");
      window.location.reload(); // Reload to trigger onboarding
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const resendMutation = trpc.auth.resendVerificationCode.useMutation({
    onSuccess: (data) => {
      alert(data.message);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      email: loginEmail,
      password: loginPassword,
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      name: registerName,
      email: registerEmail,
      password: registerPassword,
    });
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    resetMutation.mutate({
      email: resetEmail,
    });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUserId) return;
    verifyMutation.mutate({
      userId: pendingUserId,
      code: verificationCode,
    });
  };

  const handleResend = () => {
    if (!pendingUserId) return;
    resendMutation.mutate({
      userId: pendingUserId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {mode === "login" && (
          <>
            <DialogHeader>
              <DialogTitle>Entrar no Planna</DialogTitle>
              <DialogDescription>
                Entre com seu email e senha para acessar sua conta
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Esqueci minha senha
                </button>
                <div className="text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-primary hover:underline"
                  >
                    Cadastre-se
                  </button>
                </div>
              </div>
            </form>
          </>
        )}

        {mode === "register" && (
          <>
            <DialogHeader>
              <DialogTitle>Criar Conta</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para criar sua conta gratuita
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nome</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Seu nome"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Senha</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo de 6 caracteres
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline"
                >
                  Entrar
                </button>
              </div>
            </form>
          </>
        )}

        {mode === "verify" && (
          <>
            <DialogHeader>
              <DialogTitle>Confirme seu Email</DialogTitle>
              <DialogDescription>
                Enviamos um código de 6 dígitos para <strong>{pendingEmail}</strong>
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Código de Verificação</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  required
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={verifyMutation.isPending || verificationCode.length !== 6}
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </Button>
              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendMutation.isPending}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  {resendMutation.isPending ? "Enviando..." : "Reenviar código"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setVerificationCode("");
                  }}
                  className="text-muted-foreground hover:underline"
                >
                  Voltar
                </button>
              </div>
            </form>
          </>
        )}

        {mode === "reset" && (
          <>
            <DialogHeader>
              <DialogTitle>Recuperar Senha</DialogTitle>
              <DialogDescription>
                {resetSent
                  ? "Instruções enviadas! Verifique seu email."
                  : "Digite seu email para receber instruções de recuperação"}
              </DialogDescription>
            </DialogHeader>
            {!resetSent ? (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={resetMutation.isPending}
                >
                  {resetMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Instruções"
                  )}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setResetSent(false);
                    }}
                    className="text-primary hover:underline"
                  >
                    Voltar para login
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Se existe uma conta com este email, você receberá um link para
                  redefinir sua senha.
                </p>
                <Button
                  onClick={() => {
                    setMode("login");
                    setResetSent(false);
                  }}
                  className="w-full"
                >
                  Voltar para Login
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

