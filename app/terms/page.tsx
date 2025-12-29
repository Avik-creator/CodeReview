import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.png";
import { ArrowLeft } from "lucide-react";
export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 w-fit hover:opacity-80 transition-opacity"
          >
            <Image
              src={Logo}
              alt="CodeReviewer Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg shrink-0"
            />
            <span className="text-xl sm:text-2xl font-bold">CodeReviewer</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-balance">
              Terms of Use
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Last updated: December 27, 2025
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-4 sm:space-y-6">
            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                1. Acceptance of Terms
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                By accessing and using CodeReviewer, you accept and agree to be
                bound by the terms and provision of this agreement. If you do
                not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                2. Use License
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Permission is granted to temporarily access and use CodeReviewer
                for personal, non-commercial transitory viewing only. This is
                the grant of a license, not a transfer of title, and under this
                license you may not:
              </p>
              <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-sm sm:text-base text-muted-foreground ml-2 sm:ml-4">
                <li>modify or copy the materials</li>
                <li>
                  use the materials for any commercial purpose or for any public
                  display
                </li>
                <li>
                  attempt to reverse engineer any software contained on
                  CodeReviewer
                </li>
                <li>
                  remove any copyright or other proprietary notations from the
                  materials
                </li>
                <li>
                  transfer the materials to another person or &quot;mirror&quot;
                  the materials on any other server
                </li>
              </ul>
            </section>

            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                3. Code Repository Access
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                By connecting your GitHub account, you grant CodeReviewer
                permission to access your repositories for the purpose of
                providing code review services. We will only access the
                repositories you explicitly authorize.
              </p>
            </section>

            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                4. Disclaimer
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                The materials on CodeReviewer are provided on an &apos;as
                is&apos; basis. CodeReviewer makes no warranties, expressed or
                implied, and hereby disclaims and negates all other warranties
                including, without limitation, implied warranties or conditions
                of merchantability, fitness for a particular purpose, or
                non-infringement of intellectual property or other violation of
                rights.
              </p>
            </section>

            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                5. Limitations
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                In no event shall CodeReviewer or its suppliers be liable for
                any damages (including, without limitation, damages for loss of
                data or profit, or due to business interruption) arising out of
                the use or inability to use CodeReviewer.
              </p>
            </section>

            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                6. Revisions
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                CodeReviewer may revise these terms of service at any time
                without notice. By using this service you are agreeing to be
                bound by the then current version of these terms of service.
              </p>
            </section>

            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                7. Governing Law
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                These terms and conditions are governed by and construed in
                accordance with the laws and you irrevocably submit to the
                exclusive jurisdiction of the courts in that location.
              </p>
            </section>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-border">
            <Link
              href="/"
              className="text-sm sm:text-base text-primary hover:underline inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
