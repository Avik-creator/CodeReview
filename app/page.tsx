import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Logo from '@/public/logo.png';
import { requireUnAuth } from '@/lib/auth/utils';

export default async function Home(): Promise<React.ReactElement> {
  await requireUnAuth();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center gap-3 z-10">
                <Image
                  src={Logo}
                  alt={'CodeReviewer Logo'}
                  width={50}
                  height={50}
                />
                <span className="text-2xl font-bold">CodeReviewer</span>
              </div>
            </Link>
            <nav className="flex items-center gap-4">
              <Button
                asChild
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Link href="/login">Get started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-balance">
            Cut code review time & bugs in half{' '}
            <span className="text-primary">Instantly.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AI-powered PR reviews using Gemini AI with context-aware analysis
          </p>
        </div>

        {/* Hero Image - Code Review Demo */}
        <div className="mt-20 max-w-6xl mx-auto">
          <div className="relative rounded-xl border border-border overflow-hidden bg-card shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-12 bg-muted/50 border-b border-border flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="pt-12 p-8">
              <div className="bg-background rounded-lg border border-border p-6 font-mono text-sm">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5"
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">codereviewer</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          bot
                        </span>
                        <span className="text-xs text-muted-foreground">
                          1 day ago
                        </span>
                      </div>
                      <div className="space-y-3">
                        <p className="text-muted-foreground">
                          A potential issue:
                        </p>
                        <div className="bg-muted/50 rounded p-3 border-l-4 border-yellow-500">
                          <p className="text-sm">
                            A 404 might be more suitable for not found errors.
                          </p>
                        </div>
                        <p className="text-sm">Committable suggestion:</p>
                        <div className="bg-muted/30 rounded p-3 border-l-4 border-primary">
                          <pre className="text-xs">
                            <span className="text-red-400">
                              - return res.status(500).json(&#123; error &#125;)
                            </span>
                            {'\n'}
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
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold mb-12 text-center">
            What CodeReviewer Does
          </h2>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-primary">1.</span> AI-Powered Code Reviews
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Automatic PR review generation using Gemini AI. Context-aware
                reviews using RAG with Pinecone vector database. Reviews include
                walkthrough, sequence diagrams, summary, strengths, issues,
                suggestions, and even poems!
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-primary">2.</span> GitHub Integration
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect multiple repositories with automatic webhook handling
                for PR events. Real-time review generation on PR open/update
                with direct comment posting to GitHub PRs.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-primary">3.</span> RAG Implementation
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Automatic codebase indexing with vector embeddings. Semantic
                search across entire codebase with context retrieval for better
                AI reviews.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-primary">4.</span> Dashboard & Analytics
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Real-time statistics for total repos, commits, PRs, and reviews.
                GitHub contribution graph visualization with monthly activity
                breakdown and beautiful data visualization.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-primary">5.</span> Review Management
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Complete review history with status tracking (completed,
                pending, failed). Direct links to GitHub PRs with review preview
                and full content viewing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src={Logo}
                alt={'CodeReviewer Logo'}
                height={50}
                width={50}
              />
              <span className="text-lg font-bold">CodeReviewer</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
