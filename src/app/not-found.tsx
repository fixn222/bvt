import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-party-dark flex items-center justify-center p-4 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-party-neonPink/20 border border-party-neonPink/40 flex items-center justify-center mx-auto text-party-neonPink">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-6xl font-black text-white font-mono">404</h1>
        <h2 className="text-2xl font-bold text-white">Stage Not Found</h2>
        <p className="text-sm text-gray-400">
          The performance or page you are looking for does not exist or has already wrapped up.
        </p>
        <div>
          <Link href="/">
            <Button variant="primary" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Back to Main Stage</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
