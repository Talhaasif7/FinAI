import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, Palette, Save, LogOut, Camera, Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar URL input
  const [avatarUrlInput, setAvatarUrlInput] = useState("");

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url || null);
      }
    });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB allowed.", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploadingAvatar(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const url = `${publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("user_id", user.id);

    if (updateError) {
      toast({ title: "Error", description: updateError.message, variant: "destructive" });
    } else {
      setAvatarUrl(url);
      toast({ title: "Avatar updated!" });
    }
    setUploadingAvatar(false);
  };

  const handleAvatarUrl = async () => {
    if (!avatarUrlInput.trim() || !user) return;
    setUploadingAvatar(true);
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrlInput.trim() })
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAvatarUrl(avatarUrlInput.trim());
      setAvatarUrlInput("");
      toast({ title: "Avatar updated!" });
    }
    setUploadingAvatar(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("user_id", user.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Profile updated!" });
    setLoading(false);
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setEmailLoading(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Confirmation sent", description: "Check both your old and new email to confirm the change." });
      setNewEmail("");
    }
    setEmailLoading(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!" });
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordLoading(false);
  };

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Profile</p>
            <p className="text-xs text-muted-foreground">Manage your personal information</p>
          </div>
        </div>
        <div className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-16 w-16 border-2 border-border">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Profile" />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-background" />
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/60">
                  <div className="h-5 w-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Profile Picture</p>
              <p className="text-xs text-muted-foreground">Click to upload (max 2MB)</p>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <Label>Display Name</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1" placeholder="Your name" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="mt-1 opacity-60" />
          </div>
          <Button onClick={handleSaveProfile} disabled={loading} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80">
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Change Email */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Change Email</p>
            <p className="text-xs text-muted-foreground">A confirmation will be sent to both addresses</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>New Email Address</Label>
            <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="mt-1" placeholder="new@email.com" />
          </div>
          <Button onClick={handleChangeEmail} disabled={emailLoading || !newEmail.trim()} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80">
            <Mail className="h-4 w-4" />
            {emailLoading ? "Sending..." : "Update Email"}
          </Button>
        </div>
      </div>

      {/* Change Password */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <Lock className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Change Password</p>
            <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1" placeholder="••••••••" />
          </div>
          <div>
            <Label>Confirm Password</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1" placeholder="••••••••" />
          </div>
          <Button onClick={handleChangePassword} disabled={passwordLoading || !newPassword} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80">
            <Lock className="h-4 w-4" />
            {passwordLoading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
            <Palette className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Appearance</p>
            <p className="text-xs text-muted-foreground">Theme and display preferences</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Dark Mode</p>
            <p className="text-xs text-muted-foreground">Toggle between light and dark theme</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
            <Bell className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <p className="text-xs text-muted-foreground">Configure alerts and reminders</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { label: "Budget alerts", desc: "Get notified when approaching budget limits" },
            { label: "Goal reminders", desc: "Weekly progress updates on your goals" },
            { label: "Bill reminders", desc: "Alerts before subscription renewals" },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border-destructive/20">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <Shield className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Account</p>
            <p className="text-xs text-muted-foreground">Sign out of your account</p>
          </div>
        </div>
        <Button variant="destructive" onClick={signOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </motion.div>
  );
}
