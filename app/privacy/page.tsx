import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.png";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Last updated: December 27, 2025
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-4 sm:space-y-6">
            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                1. Information We Collect
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We collect information you provide directly to us when you
                create an account, including your GitHub username, email
                address, and profile information. We also collect information
                about your code repositories that you authorize us to access for
                review purposes.
              </p>
            </section>

            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                2. How We Use Your Information
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-sm sm:text-base text-muted-foreground ml-2 sm:ml-4">
                <li>
                  Provide, maintain, and improve our AI-powered code review
                  services
                </li>
                <li>
                  Process and complete transactions, and send related
                  information
                </li>
                <li>
                  Send technical notices, updates, security alerts, and support
                  messages
                </li>
                <li>
                  Respond to your comments, questions, and customer service
                  requests
                </li>
                <li>
                  Monitor and analyze trends, usage, and activities in
                  connection with our services
                </li>
              </ul>
            </section>

            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                3. Information Sharing
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We do not share, sell, rent, or trade your personal information
                with third parties for their commercial purposes. We may share
                your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-sm sm:text-base text-muted-foreground ml-2 sm:ml-4">
                <li>With your consent or at your direction</li>
                <li>
                  With third-party vendors, consultants, and service providers
                  who need access to such information to carry out work on our
                  behalf
                </li>
                <li>
                  In response to a request for information if we believe
                  disclosure is in accordance with applicable law
                </li>
                <li>
                  To protect the rights, property, and safety of CodeReviewer,
                  our users, or others
                </li>
              </ul>
            </section>

            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                4. Code Repository Data
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Your code and repository data are treated with the highest level
                of confidentiality. We only access repositories you explicitly
                authorize, and we use this data solely to provide code review
                services. Your code is processed using industry-standard
                encryption and is never shared with unauthorized parties.
              </p>
            </section>

            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                5. Data Security
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We take reasonable measures to help protect information about
                you from loss, theft, misuse, unauthorized access, disclosure,
                alteration, and destruction. All data transmission is encrypted
                using SSL/TLS protocols.
              </p>
            </section>

            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                6. Data Retention
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to
                provide you with our services and as described in this Privacy
                Policy. We will retain and use your information to the extent
                necessary to comply with our legal obligations, resolve
                disputes, and enforce our agreements.
              </p>
            </section>

            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                7. Your Rights
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                You have the right to access, update, or delete your personal
                information at any time. You can also revoke our access to your
                GitHub repositories. To exercise these rights, please contact us
                through your account settings or our support channels.
              </p>
            </section>

            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">8. Cookies</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track
                activity on our service and hold certain information. You can
                instruct your browser to refuse all cookies or to indicate when
                a cookie is being sent.
              </p>
            </section>

            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                9. Changes to This Policy
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold">
                10. Contact Us
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please
                contact us at privacy@codereviewer.com
              </p>
            </section>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-border">
            <Link
              href="/"
              className="text-sm sm:text-base text-primary hover:underline inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
