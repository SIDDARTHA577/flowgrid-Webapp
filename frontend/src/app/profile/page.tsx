"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCircle, Mail, Shield, Save } from "lucide-react";
import api from "@/lib/axios";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [isAuthenticated, router, user]);

  if (!isAuthenticated || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    // Note: This is a placeholder since we don't have a specific PUT /api/users/profile route yet.
    // In a real app, you would hit your backend update endpoint here.
    setTimeout(() => {
      setSuccess("Profile settings saved successfully!");
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 p-4 sm:p-8 pt-6">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Account Settings</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your profile details and account preferences.</p>
        </div>

        <div className="grid gap-6">
          <Card className="shadow-sm border-zinc-200">
            <CardHeader className="bg-white border-b border-zinc-100 pb-4">
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-indigo-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-zinc-100">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-3xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-zinc-900">{user.name}</h3>
                    <p className="text-sm text-zinc-500">{user.role}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      Full Name
                    </label>
                    <Input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-zinc-400" />
                      Email Address
                    </label>
                    <Input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      readOnly // Usually email shouldn't be easily changed
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-zinc-400" />
                    Account Role
                  </label>
                  <Input 
                    value={user.role}
                    disabled
                    className="bg-zinc-50"
                  />
                  <p className="text-xs text-zinc-500">Contact your administrator to change your role permissions.</p>
                </div>

                <Button type="submit" disabled={loading || !name} className="w-full sm:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>

                {success && <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">{success}</div>}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
