'use client'

import { ArrowLeft, AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import StarryBackground from "@/components/StarryBackground"
import { useLegalDocument } from "@/hooks/useLegalDocument"
import { LoadingSpinner } from "@/components/Skeletons"
import { TamperDetectedError } from "@/../src/domain/legal/errors/tamper-detected.error"

export default function PrivacyPolicyPage() {
  const router = useRouter()
  const { document, loading, error, refresh } = useLegalDocument('privacy-policy')

  return (
    <div className="min-h-screen relative">
      <StarryBackground />
      
      {/* Header */}
      <header className="sticky top-0 bg-card/80 backdrop-blur-md border-b border-border p-4 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
          </div>
          
          {error && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto p-4 py-8">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-xl p-8 shadow-2xl min-h-[400px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <LoadingSpinner size="lg" />
              <p className="text-slate-400 animate-pulse">Loading Privacy Policy...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="bg-red-500/10 p-4 rounded-full mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {error instanceof TamperDetectedError 
                  ? "Security Verification Failed" 
                  : "Error Loading Document"}
              </h2>
              <p className="text-slate-400 max-w-md mb-6">
                {error instanceof TamperDetectedError
                  ? "The integrity of this document could not be verified. It may have been tampered with. Please contact support if this persists."
                  : "We encountered an issue while trying to load the privacy policy. Please try again later."}
              </p>
              <Button onClick={() => refresh()} variant="secondary">
                Try Again
              </Button>
            </div>
          ) : document ? (
            <div className="prose prose-invert max-w-none prose-sm md:prose-base lg:prose-lg prose-headings:text-cyan-300 prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6 prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300">
              <h1>{document.title}</h1>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-800">
                <p>Version: <span className="text-slate-300 font-mono">{document.version}</span></p>
                <p>Last updated: <span className="text-slate-300">{document.lastUpdated.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span></p>
                <p>Effective: <span className="text-slate-300">{document.effectiveDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></p>
              </div>

              {document.sections.map((section, index) => (
                <section key={index} className="mb-8">
                  <h2>{section.heading}</h2>
                  {section.content && <p>{section.content}</p>}
                  {section.list.length > 0 && (
                    <ul>
                      {section.list.map((item, listIndex) => (
                        <li key={listIndex}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.link && (
                    <p className="mt-4">
                      <a 
                        href={section.link.href} 
                        className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
                        target={section.link.href.startsWith('http') ? "_blank" : undefined}
                        rel={section.link.href.startsWith('http') ? "noopener noreferrer" : undefined}
                      >
                        {section.link.text}
                      </a>
                    </p>
                  )}
                </section>
              ))}
              
              <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500 font-mono break-all">
                Verification Hash: {document.hash.value} ({document.hash.algorithm})
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
