import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "@/pages/index";
import UserCongrats from "@/pages/user/congrats";
import UserHistory from "@/pages/user/history";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUserNew from "@/pages/admin/user-new";
import AdminUserDetail from "@/pages/admin/user-detail";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Landing */}
      <Route path="/" component={Landing} />

      {/* Admin Routes */}
      <Route path="/admin/secret-login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users/new" component={AdminUserNew} />
      <Route path="/admin/users/:slug" component={AdminUserDetail} />

      {/* User Routes */}
      <Route path="/u/:slug" component={UserCongrats} />
      <Route path="/u/:slug/history" component={UserHistory} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
