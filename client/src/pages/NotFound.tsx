import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="cartoon-border cartoon-shadow bg-card rounded-3xl p-12 text-center max-w-md mx-4">
        <div className="text-8xl mb-6">🤔</div>
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-card-foreground mb-4">
          Page Not Found!
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Oops! This page got lost in the silly zone.
        </p>
        <Button
          onClick={() => setLocation("/")}
          size="lg"
          className="cartoon-border bg-primary text-primary-foreground hover:bg-primary/90 text-xl font-bold py-6 px-8"
        >
          🏠 Go Home!
        </Button>
      </div>
    </div>
  );
}
