import { Link } from "react-router"
import { ArrowRight, Github, Zap, Shield, Code, Sparkles } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CodeBlock } from "./CodeBlock"
import { VibecodeDBDiagram } from "./VibecodeDBDiagram"
import { Footer } from "./Footer"
import { Logo } from "./Logo"
import { GeekyAntsCTA } from "./GeekyAntsCTA"

const GITHUB_URL = "https://github.com/GeekyAnts/vibecode-db"
const DOCS_URL = "/doc-intro"

export function Landing() {
  return (
    <div
      className="dark min-h-screen text-foreground"
      style={{
        backgroundColor: "#050509",
        backgroundImage:
          "radial-gradient(ellipse at center top, rgba(67, 56, 202, 0.35) 0%, rgba(5, 5, 9, 0) 70%)",
      }}
    >
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-white/2 backdrop-blur-md supports-[backdrop-filter]:bg-white/2">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center space-x-4">
            <Link to={DOCS_URL} className={cn(buttonVariants({ variant: "ghost" }))}>
              Docs
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <Badge className="text-sm px-3 py-1 bg-indigo-950 text-indigo-100 border-indigo-800">
            ⚡ Frontend-First API Gateway
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Vibecode DB – The Frontend Database API Gateway
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Build apps without waiting on a backend. Prototype instantly with in-memory data, then
            connect to real backends (Supabase, PocketBase, REST, GraphQL, …) without rewriting your
            front-end.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to={DOCS_URL}
              className={cn(buttonVariants({ size: "lg" }), "text-lg px-8 py-6")}
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-lg px-8 py-6")}
            >
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
            </a>
          </div>

          {/* Architecture Diagram */}
          <div className="mt-16 flex justify-center">
            <div className="w-full max-w-6xl">
              <VibecodeDBDiagram className="w-full h-auto" width={1200} height={600} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-white/5 bg-white/2 backdrop-blur-md hover:border-white/10 transition-colors">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Start Fast</h3>
              <p className="text-muted-foreground">
                Use the in-memory Mock adapter to simulate DB, auth, storage, and functions for
                rapid prototyping.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-white/2 backdrop-blur-md hover:border-white/10 transition-colors">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Scale Seamlessly</h3>
              <p className="text-muted-foreground">
                Map to Supabase, PocketBase, REST, or GraphQL without rewriting your front-end code.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-white/2 backdrop-blur-md hover:border-white/10 transition-colors">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Backend Agnostic</h3>
              <p className="text-muted-foreground">
                Unified API across providers means less rewrite, more shipping. No vendor lock-in.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Video Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">See Vibecode DB in Action</h2>
          </div>
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg border border-white/10"
              src="https://www.youtube.com/embed/K4nHtuwQD_w"
              title="Vibecode DB Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Prototype → Scale</h2>
            <p className="text-muted-foreground text-lg">
              Start with runtime data, switch to real backends when ready
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">🚀 Prototype Phase</h3>
              <CodeBlock
                code={`import { createClient } from '@vibecode-db/client'
import { MockAdapter } from '@vibecode-db/client/adapters/mock'

// Start with in-memory data - no backend needed!
const client = createClient('', '', {
  adapter: new MockAdapter(),
})

// Your app works immediately
const { data } = await client
  .from('users')
  .select('*')
  .eq('status', 'active')
  .limit(10)`}
                language="typescript"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">⚡ Production Phase</h3>
              <CodeBlock
                code={`import { createClient } from '@vibecode-db/client'
import { SupabaseAdapter } from '@vibecode-db/client/adapters/supabase'

// Switch to a real backend - same API!
const client = createClient(url, key, {
  adapter: new SupabaseAdapter({ supabaseUrl: url, supabaseKey: key }),
})

// No code changes needed
const { data } = await client
  .from('users')
  .select('*')
  .eq('status', 'active')
  .limit(10)`}
                language="typescript"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold">Ready to build without backend dependencies?</h2>
          <p className="text-muted-foreground text-lg">
            Join developers who prototype fast and scale seamlessly with Vibecode DB&apos;s unified
            front-end API.
          </p>
          <Link to={DOCS_URL} className={cn(buttonVariants({ size: "lg" }), "text-lg px-8 py-6")}>
            Start Prototyping Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* RapidNative CTA */}
      <section className="container mx-auto px-4 py-12">
        <a href="https://www.rapidnative.com/" target="_blank" rel="noreferrer" className="group block">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950/50 via-purple-950/30 to-black/80 backdrop-blur-xl p-6 md:p-9 transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/20">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-sm font-medium text-indigo-300 uppercase tracking-wider">
                    Powered by AI
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Build Native Apps in a{" "}
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Blink
                  </span>
                </h2>

                <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
                  Transform your ideas into production-ready React Native apps with AI. Chat, draw,
                  or upload—get clean, modular code instantly.
                </p>

                <div className="flex items-center gap-2 text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  <span className="font-medium">Explore RapidNative</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="relative w-full max-w-[280px] md:max-w-[320px] opacity-90 group-hover:opacity-100 transition-opacity">
                  <img
                    src="/rapidnative-logo-dark.svg"
                    alt="RapidNative Logo"
                    width={320}
                    height={55}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </a>
      </section>

      {/* GeekyAnts CTA */}
      <div className="container mx-auto px-4 mt-12 mb-24">
        <GeekyAntsCTA />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
