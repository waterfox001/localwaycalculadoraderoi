import { useState } from "react";
import { Lock, User, KeyRound, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (token: string) => void;
}

export function AdminAuthModal({ open, onOpenChange, onSuccess }: AdminAuthModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = (await res.json()) as { success: boolean; token?: string; error?: string };

      if (res.ok && data.success && data.token) {
        sessionStorage.setItem("localway_admin_token", data.token);
        setUsername("");
        setPassword("");
        onSuccess(data.token);
        onOpenChange(false);
      } else {
        setError(data.error || "Credenciais incorretas. Tente novamente.");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor de autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-soft text-navy">
            <Lock className="h-5 w-5" />
          </div>
          <DialogTitle className="font-display text-xl font-bold text-navy">
            Acesso Administrativo Localway
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Área protegida para configuração de dados, fórmulas, gráficos e textos do relatório.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="admin-user"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Usuário
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <User className="h-4 w-4" />
              </div>
              <input
                id="admin-user"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: localway"
                className="w-full rounded-lg border border-input bg-card pl-9 pr-3 py-2.5 text-sm text-foreground outline-none transition focus:border-sky focus:ring-2 focus:ring-sky/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Senha
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-lg border border-input bg-card pl-9 pr-3 py-2.5 text-sm text-foreground outline-none transition focus:border-sky focus:ring-2 focus:ring-sky/20"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-sky cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Acessar Painel</span>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
