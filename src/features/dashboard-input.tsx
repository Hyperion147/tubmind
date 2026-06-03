import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRightIcon } from "@/components/ui/chevron-right-icon";
import Link from "next/link";

export function DashboardInputRedirect() {
    return (
        <div className="relative grid gap-3">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[1]"
                style={{
                    backgroundColor: "var(--color-primary)",
                    WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E")`,
                    maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E")`,
                    WebkitMaskRepeat: "repeat",
                    maskRepeat: "repeat",
                    WebkitMaskSize: "182px",
                    maskSize: "182px",
                }}
            />
            <div className="relative border border-border bg-card/95 p-3 shadow-2xl backdrop-blur transition-colors duration-300 hover:border-primary/40 hover:bg-card focus-within:border-primary focus-within:bg-card">
                <span className="pointer-events-none absolute -left-px -top-px h-4 w-4 border-l border-t border-primary" />
                <span className="pointer-events-none absolute -bottom-px -right-px h-4 w-4 border-b border-r border-primary" />

                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem] md:items-center">
                    <label
                        htmlFor="idea-title"
                        className="flex min-h-12 items-center border border-border bg-background/75"
                    >
                        <Input
                            id="idea-title"
                            placeholder="Enter your idea..."
                            className="h-10 border-0 bg-transparent px-4 text-center text-[15px] shadow-none focus-visible:ring-0 md:text-left"
                        />
                    </label>

                    <Button
                        type="button"
                        size="icon"
                        className="h-12 w-full transition-colors duration-300 hover:bg-primary/90 gap-2 md:w-auto md:px-3"
                    >
                        <Link
                            href="https://app.tubmind.space"
                            className="flex items-center gap-2"
                        >
                            <span>Capture your idea</span>
                            <ChevronRightIcon
                                size={64}
                                duration={1}
                                color="#ffffff"
                            />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
