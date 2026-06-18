import Link from "next/link";
import { ArrowRight, LayoutDashboard, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function ListingFlowPanel({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Card className="md:block hidden border-border bg-secondary/90 shadow-xl backdrop-blur-2xl transition-colors duration-300 hover:border-primary/35 hover:bg-secondary">
      <CardHeader>
        <div className="shadow-xs mb-4">
          <CardTitle className="text-xl">Listing flow</CardTitle>
          <CardDescription className="mt-3 text-sm leading-6">
            Public ideas stay browsable.
            Sign in to add comments.
          </CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="relative flex-col items-stretch gap-3">
        <Button asChild>
          <Link href="/" className="justify-between">
            Manage your ideas
            <LayoutDashboard className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/#quick-capture" className="justify-between">
            Capture a new one
            <Sparkles className="size-4" />
          </Link>
        </Button>
        {isAdmin ? (
          <Button asChild variant="outline">
            <Link href="/admin" className="justify-between">
              Admin controls
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
