import { Link } from "react-router"
import { Github, BookOpen, FileText } from "lucide-react"
import { Logo } from "./Logo"

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-white/2 backdrop-blur-md">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs">
              The Frontend Database API Gateway. Build apps without waiting on a backend.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/doc-intro" className="text-sm text-muted-foreground hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/doc-install" className="text-sm text-muted-foreground hover:text-white transition-colors">
                  Installation
                </Link>
              </li>
              <li>
                <Link to="/doc-create-client" className="text-sm text-muted-foreground hover:text-white transition-colors">
                  Creating a Client
                </Link>
              </li>
              <li>
                <Link to="/doc-mock-adapter" className="text-sm text-muted-foreground hover:text-white transition-colors">
                  Adapters
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/GeekyAnts/vibecode-db" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center space-x-2">
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a href="https://blog.geekyants.com" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Blog</span>
                </a>
              </li>
              <li>
                <Link to="/doc-mock-adapter" className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Adapters</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://geekyants.com" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-white transition-colors">
                  GeekyAnts
                </a>
              </li>
              <li>
                <a href="https://geekyants.com/about-us" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-white transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Vibecode DB. All rights reserved.
            </div>
            <div className="text-sm text-muted-foreground">
              Created by{" "}
              <a
                href="https://geekyants.com"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              >
                GeekyAnts
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
