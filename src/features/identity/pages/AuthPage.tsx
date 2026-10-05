import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Mail, Phone } from "lucide-react";

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  // email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // phone
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: fullName, language: localStorage.getItem("i18nextLng") || "fr" },
          },
        });
        if (error) throw error;
        toast.success(t("auth.signedUp"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.signedIn"));
      }
      navigate("/");
    } catch (e: any) {
      toast.error(e.message || t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSend = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setOtpSent(true);
      toast.success("Code envoyé");
    } catch (e: any) {
      toast.error(e.message || t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
      if (error) throw error;
      toast.success(t("auth.signedIn"));
      navigate("/");
    } catch (e: any) {
      toast.error(e.message || t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-earth flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-serif text-primary mb-2">{t("app.name")}</h1>
          <p className="text-muted-foreground text-sm">{t("auth.subtitle")}</p>
        </div>

        <div className="card-soft p-6 space-y-5">
          <div className="flex gap-2 p-1 rounded-xl bg-muted">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === "signin" ? "bg-card shadow-soft" : "text-muted-foreground"}`}
            >{t("auth.signIn")}</button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === "signup" ? "bg-card shadow-soft" : "text-muted-foreground"}`}
            >{t("auth.signUp")}</button>
          </div>

          <Tabs defaultValue="email">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="email"><Mail className="size-4 mr-1.5" /> {t("auth.email")}</TabsTrigger>
              <TabsTrigger value="phone"><Phone className="size-4 mr-1.5" /> {t("auth.phone")}</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-3 mt-4">
              <form onSubmit={handleEmail} className="space-y-3">
                {mode === "signup" && (
                  <div>
                    <Label htmlFor="name">{t("auth.fullName")}</Label>
                    <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                )}
                <div>
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="pwd">{t("auth.password")}</Label>
                  <Input id="pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-warm">
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  {t("auth.continueWithEmail")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="space-y-3 mt-4">
              <div>
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <Input id="phone" type="tel" placeholder="+237699999999" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <p className="text-caption mt-1">{t("auth.phoneNote")}</p>
              </div>
              {otpSent && (
                <div>
                  <Label htmlFor="otp">{t("auth.otpCode")}</Label>
                  <Input id="otp" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} />
                </div>
              )}
              {!otpSent ? (
                <Button onClick={handlePhoneSend} disabled={loading || !phone} className="w-full" variant="secondary">
                  {loading && <Loader2 className="size-4 animate-spin" />} {t("auth.sendOtp")}
                </Button>
              ) : (
                <Button onClick={handlePhoneVerify} disabled={loading || otp.length < 4} className="w-full bg-gradient-warm">
                  {loading && <Loader2 className="size-4 animate-spin" />} {t("auth.verifyOtp")}
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
