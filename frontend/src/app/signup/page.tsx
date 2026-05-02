"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SignupPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const passwordValue = form.watch("password");

  const getPasswordStrength = (pass: string) => {
    const checks = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass),
    };
    
    let score = Object.values(checks).filter(Boolean).length;
    
    let label = "Weak";
    let color = "bg-rose-500";
    let textColor = "text-rose-600";
    
    if (score === 0) {
      label = "Very Weak";
      color = "bg-zinc-200";
      textColor = "text-zinc-500";
    } else if (score === 1 || score === 2) {
      label = "Weak";
      color = "bg-rose-500";
      textColor = "text-rose-600";
    } else if (score === 3) {
      label = "Medium";
      color = "bg-amber-500";
      textColor = "text-amber-600";
    } else if (score === 4) {
      label = "Strong";
      color = "bg-emerald-500";
      textColor = "text-emerald-600";
    }

    return { score, label, color, textColor, checks };
  };

  const strength = getPasswordStrength(passwordValue);

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setIsLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/signup", {
        name: values.name,
        email: values.email,
        password: values.password,
      });
      setUser(data);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-xl border-zinc-200">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold tracking-tight text-center text-zinc-900">
              Create an account
            </CardTitle>
            <CardDescription className="text-center text-base text-zinc-500">
              Enter your details to sign up for Flowgrid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="p-4 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg">
                    {error}
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-base font-semibold text-zinc-800">Full Name</FormLabel>
                      <FormControl>
                        <Input className="h-12 text-base px-4 bg-white" placeholder="John Doe" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-base font-semibold text-zinc-800">Email Address</FormLabel>
                      <FormControl>
                        <Input className="h-12 text-base px-4 bg-white" placeholder="m@example.com" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-base font-semibold text-zinc-800">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input className="h-12 text-base px-4 bg-white pr-10" type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isLoading} />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </FormControl>
                      
                      {passwordValue && (
                        <div className="pt-3 space-y-3">
                          <div className="flex gap-1.5 h-1.5 w-full">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className="relative h-full flex-1 rounded-full bg-zinc-100 overflow-hidden"
                              >
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: level <= strength.score ? '100%' : '0%' }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                  className={`absolute top-0 left-0 h-full w-full ${strength.color}`}
                                />
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400">Password Strength</span>
                            <span className={`text-[11px] font-bold tracking-wider uppercase ${strength.textColor}`}>
                              {strength.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className={`flex items-center gap-1.5 text-xs transition-colors duration-300 ${strength.checks.length ? 'text-emerald-600 font-medium' : 'text-zinc-500'}`}>
                              {strength.checks.length ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                              <span>8+ characters</span>
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs transition-colors duration-300 ${strength.checks.uppercase ? 'text-emerald-600 font-medium' : 'text-zinc-500'}`}>
                              {strength.checks.uppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                              <span>Uppercase letter</span>
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs transition-colors duration-300 ${strength.checks.number ? 'text-emerald-600 font-medium' : 'text-zinc-500'}`}>
                              {strength.checks.number ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                              <span>Number</span>
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs transition-colors duration-300 ${strength.checks.special ? 'text-emerald-600 font-medium' : 'text-zinc-500'}`}>
                              {strength.checks.special ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                              <span>Special character</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-base font-semibold text-zinc-800">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input className="h-12 text-base px-4 bg-white pr-10" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isLoading} />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 focus:outline-none"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-12 text-base font-semibold mt-4" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign up for Flowgrid"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-zinc-100 p-6 bg-zinc-50/50 rounded-b-xl">
            <p className="text-base text-zinc-600">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
