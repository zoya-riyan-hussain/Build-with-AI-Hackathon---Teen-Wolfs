import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

// Pages
import { Profile } from "./pages/profile";
import { Dashboard } from "./pages/dashboard";
import { Careers } from "./pages/careers";
import { Simulation } from "./pages/simulation";
import { Performance } from "./pages/performance";
import { Feedback } from "./pages/feedback";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Profile} />
      <Route path="/profile" component={Profile} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/careers" component={Careers} />
      <Route path="/simulation" component={Simulation} />
      <Route path="/performance" component={Performance} />
      <Route path="/feedback" component={Feedback} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
