import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import { LoginPage } from "@/pages/Login";
import Home from "@/pages/home";
import CurrentAffairs from "@/pages/current-affairs";
import Syllabus from "@/pages/syllabus";
import Practice from "@/pages/practice";
import Progress from "@/pages/progress";
import Profile from "@/pages/profile";
import LoadingSpinner from "@/components/ui/loading-spinner";

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/" /> : <LoginPage />}
      </Route>
      <Route path="/">
        {isAuthenticated ? <Home /> : <Landing />}
      </Route>

      {isAuthenticated && (
        <>
          <Route path="/current-affairs" component={CurrentAffairs} />
          <Route path="/syllabus" component={Syllabus} />
          <Route path="/practice" component={Practice} />
          <Route path="/progress" component={Progress} />
          <Route path="/profile" component={Profile} />
        </>
      )}

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
