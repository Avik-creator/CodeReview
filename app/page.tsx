import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Logo from "@/public/logo.png";
import { requireUnAuth } from "@/lib/auth/utils";

export default async function Home(): Promise<React.ReactElement> {
  await requireUnAuth();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <Image
                src={Logo}
                alt="CodeReviewer Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg shrink-0"
              />
              <span className="text-xl sm:text-2xl font-bold">
                CodeReviewer
              </span>
            </Link>
            <nav className="flex items-center gap-4">
              <Button
                asChild
                size="sm"
                className="bg-primary hover:bg-primary/90 text-sm sm:text-base"
              >
                <Link href="/login">Get started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight text-balance">
            Cut code review time & bugs in half{" "}
            <span className="text-primary">Instantly.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            AI-powered PR reviews using Gemini AI with context-aware analysis
          </p>
        </div>

        {/* Hero Image - Code Review Demo */}
        <div className="mt-12 sm:mt-16 md:mt-20 max-w-6xl mx-auto px-4">
          <div className="relative rounded-lg sm:rounded-xl border border-border overflow-hidden bg-card shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-10 sm:h-12 bg-muted/50 border-b border-border flex items-center px-3 sm:px-4 gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="pt-10 sm:pt-12 p-4 sm:p-6 md:p-8">
              <div className="bg-background rounded-lg border border-border p-4 sm:p-6 font-mono text-xs sm:text-sm">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 3L5 7l4 4" />
                        <path d="M15 3l4 4-4 4" />
                        <path d="M12 3v18" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-semibold">codereviewer</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          bot
                        </span>
                        <span className="text-xs text-muted-foreground">
                          1 day ago
                        </span>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <p className="text-muted-foreground">
                          A potential issue:
                        </p>
                        <div className="bg-muted/50 rounded p-2 sm:p-3 border-l-4 border-yellow-500">
                          <p className="text-xs sm:text-sm">
                            A 404 might be more suitable for not found errors.
                          </p>
                        </div>
                        <p className="text-xs sm:text-sm">
                          Committable suggestion:
                        </p>
                        <div className="bg-muted/30 rounded p-2 sm:p-3 border-l-4 border-primary overflow-x-auto">
                          <pre className="text-xs">
                            <span className="text-red-400">
                              - return res.status(500).json(&#123; error &#125;)
                            </span>
                            {"\n"}
                            <span className="text-green-400">
                              + return res.status(404).json(&#123; error &#125;)
                            </span>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal features overview */}
      <section
        id="features"
        className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center px-4">
            What CodeReviewer Does
          </h2>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 flex items-start gap-2">
                <span className="text-primary shrink-0">1.</span>
                <span>AI-Powered Code Reviews</span>
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Automatic PR review generation using Gemini AI. Context-aware
                reviews using RAG with Pinecone vector database. Reviews include
                walkthrough, sequence diagrams, summary, strengths, issues,
                suggestions, and even poems!
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 flex items-start gap-2">
                <span className="text-primary shrink-0">2.</span>
                <span>GitHub Integration</span>
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Connect multiple repositories with automatic webhook handling
                for PR events. Real-time review generation on PR open/update
                with direct comment posting to GitHub PRs.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 flex items-start gap-2">
                <span className="text-primary shrink-0">3.</span>
                <span>RAG Implementation</span>
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Automatic codebase indexing with vector embeddings. Semantic
                search across entire codebase with context retrieval for better
                AI reviews.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 flex items-start gap-2">
                <span className="text-primary shrink-0">4.</span>
                <span>Dashboard & Analytics</span>
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Real-time statistics for total repos, commits, PRs, and reviews.
                GitHub contribution graph visualization with monthly activity
                breakdown and beautiful data visualization.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 flex items-start gap-2">
                <span className="text-primary shrink-0">5.</span>
                <span>Review Management</span>
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Complete review history with status tracking (completed,
                pending, failed). Direct links to GitHub PRs with review preview
                and full content viewing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image
                src={Logo}
                alt="CodeReviewer Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg"
              />
              <span className="text-base sm:text-lg font-bold">
                CodeReviewer
              </span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms of Use
              </Link>
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
