
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlizoLogo } from "../icons/flizo-logo";
import { useLanguage } from "@/hooks/use-language";
import { sendFCMToken } from "@/services/flizo.service";

const formSchema = (t: any) => z.object({
  email: z.string().email({ message: t.emailInvalid }),
  password: z.string().min(1, { message: t.passwordRequired }),
  rememberMe: z.boolean().default(false).optional(),
});


export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const loginTranslations = t.loginForm;

  const currentFormSchema = formSchema(loginTranslations);

  const form = useForm<z.infer<typeof currentFormSchema>>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof currentFormSchema>) {
    setIsSubmitting(true);
    
    const serverApi = process.env.NEXT_PUBLIC_serverApi || 'https://s1.flizo.app/api/';
    
    const params = new URLSearchParams({
        email: values.email,
        password: values.password,
    });

    try {
      const response = await fetch(`${serverApi}login?${params.toString()}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(loginTranslations.genericError);
      }
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Received invalid JSON from server.");
      }

      if (data.status !== 1) {
        throw new Error(data.message || loginTranslations.genericError);
      }

      const token = data.user_api_hash;
      const permissions = data.permissions;
      const profile = { email: data.email, id: data.id, full_name: data.full_name };

      if (token) {
        const storage = values.rememberMe ? localStorage : sessionStorage;
        
        storage.setItem("user_api_hash", token);
        if (permissions) {
          storage.setItem("permissions", JSON.stringify(permissions));
        }
        if (profile) {
            storage.setItem("profile", JSON.stringify(profile));
        }

        // Send FCM token to backend
        const fcmToken = localStorage.getItem("fcm_token");
        if (fcmToken) {
          try {
            await sendFCMToken(token, fcmToken);
          } catch (fcmError) {
            console.error("Failed to send FCM token:", fcmError);
            // Non-critical error, so we don't block the login
            toast({
              variant: "destructive",
              title: "Error de Sincronización",
              description: "No se pudo registrar el dispositivo para notificaciones.",
            });
          }
        }

        window.location.href = "/maps";
      } else {
         throw new Error(data.message || loginTranslations.genericError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : loginTranslations.unexpectedError;
      toast({
        variant: "destructive",
        title: loginTranslations.loginFailedTitle,
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const privacyPolicyUrl = `${process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/'}page/privacy_policy_new`;

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center pt-4">
            <FlizoLogo />
        </div>
        <CardDescription>
          {loginTranslations.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{loginTranslations.emailLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={loginTranslations.emailPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{loginTranslations.passwordLabel}</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{loginTranslations.rememberMeLabel}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <Link
                href="#"
                className="text-sm font-medium text-primary hover:underline hover:text-accent-foreground"
              >
                {loginTranslations.forgotPasswordLink}
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? loginTranslations.signingInButton : loginTranslations.signInButton}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center text-center text-xs text-muted-foreground space-y-4">
         <div className="w-full">
            <Select onValueChange={setLanguage} defaultValue={language}>
              <SelectTrigger>
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        <p>
          {loginTranslations.privacyPolicyText}{" "}
          <Link href={privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
            {loginTranslations.privacyPolicyLink}
          </Link>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
