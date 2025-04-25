import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useRedirect } from "@/contexts/redirect-context";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();

  // Set initial auth mode from URL
  useEffect(() => {
    const params = new URLSearchParams(search);
    const mode = params.get("mode");
    if (mode === "signup") {
      setActiveTab("register");
    } else if (mode === "login") {
      setActiveTab("login");
    }
  }, [search]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate(data);
  }

  function onRegisterSubmit(data: RegisterFormValues) {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  }

  // Handle redirects
  const { redirectPath, setRedirectPath } = useRedirect();
  
  useEffect(() => {
    if (user) {
      setLocation(redirectPath || "/dashboard");
      // Clear the redirect path after use
      setRedirectPath(null);
    }
  }, [user, setLocation, redirectPath, setRedirectPath]);

  const isAuthLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gradient-to-br from-teal-50 to-teal-100/50">
      {/* Left side - Auth forms */}
      <div className="flex flex-col items-center justify-center p-6 md:w-1/2">
        <div className="w-full max-w-md mx-auto">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-center text-teal-600">MediAI</h1>
            <p className="text-center text-muted-foreground">
              Your personal health assistant powered by AI
            </p>
          </div>

          <Tabs 
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              const mode = value === "register" ? "signup" : "login";
              setLocation(`/auth?mode=${mode}`, { replace: true });
            }}
            className="w-full mt-8"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="your.email@example.com" 
                                {...field} 
                                disabled={isAuthLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                                disabled={isAuthLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-teal-600 hover:bg-teal-700" 
                        disabled={isAuthLoading}
                      >
                        {isAuthLoading && loginMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Sign In
                      </Button>
                    </form>
                    <div className="my-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                        onClick={() => { window.location.href = '/auth/google'; }}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 48 48">
                          <g>
                            <path fill="#4285F4" d="M24 9.5c3.54 0 6.44 1.23 8.44 3.26l6.31-6.3C34.62 2.13 29.74 0 24 0 14.82 0 6.95 5.4 2.69 13.32l7.73 6.01C12.14 13.18 17.57 9.5 24 9.5z"/>
                            <path fill="#34A853" d="M46.1 24.55c0-1.56-.14-3.1-.4-4.55H24v9.13h12.45c-.54 2.9-2.14 5.36-4.57 7.04l7.09 5.52C43.99 37.1 46.1 31.36 46.1 24.55z"/>
                            <path fill="#FBBC05" d="M10.42 28.34A14.56 14.56 0 019.5 24c0-1.5.26-2.95.72-4.34l-7.73-6.01A23.94 23.94 0 000 24c0 3.85.92 7.5 2.54 10.74l7.88-6.4z"/>
                            <path fill="#EA4335" d="M24 48c6.48 0 11.92-2.13 15.89-5.8l-7.09-5.52c-1.97 1.32-4.5 2.12-8.8 2.12-6.43 0-11.86-3.68-13.58-8.81l-7.88 6.4C6.95 42.6 14.82 48 24 48z"/>
                            <path fill="none" d="M0 0h48v48H0z"/>
                          </g>
                        </svg>
                        Sign in with Google
                      </Button>
                    </div>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-sm text-center text-muted-foreground">
                    Don't have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto" 
                      onClick={() => setActiveTab("register")}
                    >
                      Register
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Enter your information to create a new account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John" 
                                  {...field} 
                                  disabled={isAuthLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Doe" 
                                  {...field} 
                                  disabled={isAuthLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="your.email@example.com" 
                                {...field} 
                                disabled={isAuthLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                                disabled={isAuthLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                                disabled={isAuthLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-teal-600 hover:bg-teal-700" 
                        disabled={isAuthLoading}
                      >
                        {isAuthLoading && registerMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Create Account
                      </Button>
                    </form>
                    <div className="my-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                        onClick={() => { window.location.href = '/auth/google'; }}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 48 48">
                          <g>
                            <path fill="#4285F4" d="M24 9.5c3.54 0 6.44 1.23 8.44 3.26l6.31-6.3C34.62 2.13 29.74 0 24 0 14.82 0 6.95 5.4 2.69 13.32l7.73 6.01C12.14 13.18 17.57 9.5 24 9.5z"/>
                            <path fill="#34A853" d="M46.1 24.55c0-1.56-.14-3.1-.4-4.55H24v9.13h12.45c-.54 2.9-2.14 5.36-4.57 7.04l7.09 5.52C43.99 37.1 46.1 31.36 46.1 24.55z"/>
                            <path fill="#FBBC05" d="M10.42 28.34A14.56 14.56 0 019.5 24c0-1.5.26-2.95.72-4.34l-7.73-6.01A23.94 23.94 0 000 24c0 3.85.92 7.5 2.54 10.74l7.88-6.4z"/>
                            <path fill="#EA4335" d="M24 48c6.48 0 11.92-2.13 15.89-5.8l-7.09-5.52c-1.97 1.32-4.5 2.12-8.8 2.12-6.43 0-11.86-3.68-13.58-8.81l-7.88 6.4C6.95 42.6 14.82 48 24 48z"/>
                            <path fill="none" d="M0 0h48v48H0z"/>
                          </g>
                        </svg>
                        Sign in with Google
                      </Button>
                    </div>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto" 
                      onClick={() => setActiveTab("login")}
                    >
                      Sign in
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Info area */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-teal-100 to-teal-50 p-12 items-center justify-center">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold mb-6">Your Health Journey, <br />AI-Enhanced</h2>
          <p className="text-lg mb-6">
            MediAI combines advanced AI with personalized health tracking to give you better insights about your wellbeing.
          </p>
          <ul className="space-y-8">
            <li className="flex items-start">
              <div className="mr-6 bg-teal-100 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">AI Symptom Analysis</h3>
                <p className="text-muted-foreground text-lg">Get instant insights about your symptoms from our advanced AI models.</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="mr-6 bg-teal-100 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Personal Health Profile</h3>
                <p className="text-muted-foreground text-lg">Create your health profile for better, more personalized care suggestions.</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="mr-6 bg-teal-100 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                  <path d="M2 9h18v12H2z" />
                  <path d="M4 4h16v5H4z" />
                  <path d="M12 4v9" />
                  <path d="M10 16a2 2 0 1 1 4 0v4h-4v-4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Health Tracking Dashboard</h3>
                <p className="text-muted-foreground text-lg">Monitor your health metrics and see progress over time.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}