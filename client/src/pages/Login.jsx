import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthContext } from "@/hooks/useAuthContext";
import api from "@/lib/helper"; // ← Чиний helper js

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Бүх талбарыг бөглөнө үү");
      return;
    }

    try {
      const userData = await api.send("/user/login", {
        email,
        password,
      });

      login(userData);

      setLocation("/");
    } catch (err) {
      setError(err.message || err.error || "Нэвтрэхэд алдаа гарлаа");
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-chart-2/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-chart-3/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-semibold text-xl">Өдрийн төлөвлөгөө</span>
            </div>
            <ThemeToggle />
          </div>

          {/* Login Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold mb-2">Сайн байна уу</h1>
            <p className="text-muted-foreground mb-8">Өдрийн төлөвлөгөөний бүртгэлдээ нэвтрэх</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Имэйл</label>
                <Input
                  type="email"
                  placeholder="та@жишээ.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-login-email"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Нууц үг</label>
                <Input
                  type="password"
                  placeholder="Нууц үг оруулна уу"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-login-password"
                  className="w-full"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg" data-testid="text-login-error">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full mt-6" data-testid="button-login-submit">
                Нэвтрэх
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Бүртгэл байхгүй юу?{" "}
                <button
                  onClick={() => setLocation("/register")}
                  className="text-primary font-medium hover:underline cursor-pointer"
                  data-testid="link-to-register"
                >
                  Бүртгүүлэх
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
