"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import axios, { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggingIn, loginError } = useAuth();

  const methods = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      role: "student", // Default selection
    },
  });

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = methods;

  async function onSubmit(values: LoginInput) {
    try {
      const response = await login(values);
      const userRole = response.data.user.role;
      // Route based on selected role
      router.push(
        userRole === "educator" ? "/educator/dashboard" : "/student/dashboard",
      );
    } catch (error) {
      console.error("Login failed", error);
    }
  }

  return (
    <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Select your portal and enter your credentials
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Display Backend Error */}
            {loginError && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-md">
                {axios.isAxiosError(loginError)
                  ? loginError.response?.data?.message || loginError.message
                  : loginError.message || "Invalid credentials"}
              </div>
            )}

            {/* ROLE SELECTION RADIO BUTTONS */}
            <div className="space-y-3 pb-2">
              <Label>Log in to the...</Label>
              <div className="flex gap-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="student"
                    {...registerField("role")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">Student Portal</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="educator"
                    {...registerField("role")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">Educator Portal</span>
                </label>
              </div>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@college.edu"
                {...registerField("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                {...registerField("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full font-semibold mt-4"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Authenticating..." : "Sign in"}
            </Button>
          </form>
        </FormProvider>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground text-center w-full">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
