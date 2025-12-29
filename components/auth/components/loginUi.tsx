import { GithubSignInButton } from "@/components/auth/components/login/githubSignin";
import { CodePattern } from "@/components/auth/components/login/codePattern";
import Image from "next/image";
import Logo from "@/public/logo.png";
import Link from "next/link";
export default function LoginUI() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Side - Hero Section */}
      <div className="flex-1 relative flex flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 overflow-hidden">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 z-10">
          <Image
            src={Logo}
            alt="CodeReviewer Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shrink-0"
          />
          <span className="text-xl sm:text-2xl font-bold">CodeReviewer</span>
        </Link>

        {/* Hero Content */}
        <div className="z-10 max-w-2xl py-8 sm:py-12 lg:py-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 text-balance">
            Cut Code Review Time & Bugs in{" "}
            <span className="text-primary">Half.</span> Instantly.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed font-mono">
            Supercharge your team to ship faster with the most advanced AI code
            reviews.
          </p>
        </div>

        {/* Decorative Code Pattern */}
        <CodePattern />

        {/* Empty space for better layout on desktop */}
        <div className="hidden lg:block" />
      </div>

      {/* Right Side - Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 bg-background lg:bg-card/30">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl">
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-primary text-balance">
                  Welcome Back
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Login using
                </p>
              </div>

              <div className="space-y-4">
                <GithubSignInButton />
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-center text-muted-foreground mt-4 sm:mt-6 leading-relaxed px-2">
            By continuing, you agree to the{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>{" "}
            applicable to CodeReviewer
          </p>
        </div>
      </div>
    </div>
  );
}
