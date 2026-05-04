// CREATED: 2025-04-17 - User Registration Page
// Public page for new user registration

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { UserPlus, Mail, Lock, User, Phone, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiPost } from "@/lib/admin-api";
import { ApiErrorAlert } from "@/components/ui/api-error-alert";
import { cn } from "@/lib/utils";

const RegisterSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  full_name: z.string().min(2, "Nama lengkap minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  phone: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^[0-9\-\+\s]{10,15}$/.test(val);
  }, "Nomor telepon tidak valid"),
});

type RegisterInput = z.infer<typeof RegisterSchema>;

interface RegisterResponse {
  id: string;
  email: string;
  full_name: string;
  message: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      phone: "",
    },
  });

  const { mutate, isPending, error } = useMutation<RegisterResponse, Error, RegisterInput>({
    mutationFn: async (data) => {
      const response = await apiPost<RegisterResponse>("/auth/register", data);
      return response;
    },
    onSuccess: () => {
      setShowSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 2000);
    },
  });

  const onSubmit = (data: RegisterInput) => {
    mutate(data);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Registrasi Berhasil!
            </h2>
            <p className="text-slate-600 mb-4">
              Akun Anda telah berhasil dibuat. Mengalihkan ke halaman login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-[#681212]" />
            Daftar Akun
          </CardTitle>
          <CardDescription>
            Buat akun baru untuk mengakses platform EVORA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="full_name"
                  placeholder="Masukkan nama lengkap"
                  className={cn("pl-10", errors.full_name && "border-red-500")}
                  disabled={isPending}
                  {...register("full_name")}
                />
              </div>
              {errors.full_name && (
                <p className="text-sm text-red-500">{errors.full_name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  className={cn("pl-10", errors.email && "border-red-500")}
                  disabled={isPending}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon (Opsional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08123456789"
                  className={cn("pl-10", errors.phone && "border-red-500")}
                  disabled={isPending}
                  {...register("phone")}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  className={cn("pl-10", errors.password && "border-red-500")}
                  disabled={isPending}
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <ApiErrorAlert
                error={error}
                className="mt-4"
              />
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#681212] hover:bg-[#8a1a1a]"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Mendaftar...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Daftar
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-[#681212] hover:underline font-medium"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
