import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthContext } from "@/hooks/useAuthContext";
import api from "@/lib/helper";

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuthContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Бүх талбарыг бөглөнө үү");
      return;
    }


    if (formData.password.length < 6) {
      setError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
      return;
    }

    try {

     const data = await api.post("/user/register", {
      name: formData.name,
      email: formData.email,
      password: formData.password,
});


      login(data.user);

      setLocation("/");
    } catch (err) {
      setError(err.message || "Бүртгэл үүсгэхэд алдаа гарлаа");
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top1/3 -left-20 w-60 h-60 bg-chart-2/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-chart-3/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-semibold text-xl">Өдрийн төлөвлөгөө</span>
            </div>
            <ThemeToggle />
          </div>

          {/* Register Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold mb-2">Бүртгэл үүсгэх</h1>
            <p className="text-muted-foreground mb-8">
              Girlscode-д нэгдэж бүтээмжээ нэмэгдүүл
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                <label className="text-sm font-medium block mb-2">Нэр</label>
                  <Input
                    type="text"
                    name="name"
                  placeholder="Жон"
                    value={formData.name}
                    onChange={handleChange}
                    data-testid="input-register-firstName"
                  />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Имэйл</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="та@жишээ.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Нууц үг</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Нууц үг оруулна уу"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>


              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full mt-6">
                Бүртгэл үүсгэх
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Бүртгэлтэй юу?{" "}
                <button
                  onClick={() => setLocation("/login")}
                  className="text-primary font-medium hover:underline cursor-pointer"
                >
                  Нэвтрэх
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
