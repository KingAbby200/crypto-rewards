import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export default function AdminLogin() {
  const login = useLogin();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    login.mutate({ data });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
            <Lock className="w-8 h-8 text-black" />
          </div>
          <div>
            <CardTitle className="text-3xl font-semibold tracking-tight">Admin Access</CardTitle>
            <p className="text-zinc-400 mt-2">Enter your admin password to continue</p>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="bg-black border-zinc-700 text-lg py-6"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full py-6 text-base font-medium bg-white text-black hover:bg-zinc-200"
                disabled={login.isPending}
              >
                {login.isPending ? "Authenticating..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
