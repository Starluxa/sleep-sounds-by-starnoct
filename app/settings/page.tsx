'use client'

import { Button } from "@/components/ui/button"
import { ArrowLeft, Maximize2, BatteryCharging, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from 'next/link'

import { useAccessibility } from "@/contexts/accessibility-context"
import { CardSize } from "@/contexts/accessibility-context"

import { Suspense, useEffect } from "react"
import ChevronRightIcon from "@/components/icons/ChevronRightIcon"
import { useSettingsViewModel } from "@/hooks/useSettingsViewModel"
import { SettingsIcon } from "@/components/settings/SettingsIconMapper"
import { ISettingsItem } from "../../src/core/settings/types"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useBatteryOptimization } from '@/hooks/useBatteryOptimization'
import { OptimizationGuide } from "@/components/OptimizationGuide"
import { Capacitor } from '@capacitor/core'
import { APP_VERSION } from '@/constants'
import { AudioControl } from "@/lib/native-audio-bridge"
import { toast } from "@/hooks/use-toast"


function SettingsContent() {
  const router = useRouter();
  const { cardSize, setCardSize } = useAccessibility();

  const isNative = Capacitor.isNativePlatform();
  const { isIgnoring, loading, checkOptimization, requestOptimization } =
    useBatteryOptimization();

  const statusText = loading ? 'Checking…' : isIgnoring ? 'Optimized ✅' : 'Not optimized ⚠️';
  const progressValue = loading ? 50 : isIgnoring ? 100 : 0;

  const { menu, onItemClick } = useSettingsViewModel();

  // Flatten menu sections and filter to relevant items
  // NOTE: 'feedback' is temporarily disabled - see SettingsFactory.ts for details
  const relevantItems = menu.sections.flatMap(section => section.items)
    .filter(item => ['saved-mixes', 'rate-app', 'privacy', 'terms'].includes(item.id));

  // Color mappings for visual consistency
  // NOTE: 'feedback' color mappings commented out for when feature is re-enabled
  const colorMap: Record<string, string> = {
    'saved-mixes': 'from-sky-600/30 to-sky-800/20',
    'rate-app': 'from-yellow-600/30 to-yellow-800/20',
    // 'feedback': 'from-emerald-600/30 to-emerald-800/20',
    'privacy': 'from-indigo-600/30 to-indigo-800/20',
    'terms': 'from-blue-600/30 to-blue-800/20',
  };

  const textColorMap: Record<string, string> = {
    'saved-mixes': 'text-sky-400',
    'rate-app': 'text-yellow-400',
    // 'feedback': 'text-emerald-400',
    'privacy': 'text-indigo-400',
    'terms': 'text-blue-400',
  };

  // Prefetch legal pages for instant navigation
  useEffect(() => {
    router.prefetch('/');
    router.prefetch('/privacy-policy');
    router.prefetch('/terms-of-service');
    router.prefetch('/saved-mixes');
  }, [router]);

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="ml-auto">
            <Link
              href="/"
              aria-label="Home"
              className="inline-flex items-center justify-center rounded-xl p-2.5 min-w-11 min-h-11 text-foreground/70 hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <Home className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pt-6 space-y-4">
        {/* Accessibility Settings */}
        <div className="mb-6 p-5 rounded-xl bg-linear-to-br from-purple-700/30 to-purple-900/10 border border-purple-600/30 backdrop-blur-md shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <Maximize2 className="h-4 w-4 text-purple-300" />
            <h3 className="text-sm font-semibold text-purple-300">Accessibility</h3>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-gray-300 mb-3">Card Size - Adjusts sound card and text sizes</p>
            {[
              { value: 'small' as CardSize, label: 'Small', desc: 'Compact - fits more cards' },
              { value: 'medium' as CardSize, label: 'Medium', desc: 'Balanced - default' },
              { value: 'large' as CardSize, label: 'Large', desc: 'Accessible - easier to read' },
            ].map((option) => (
              <Button
                key={option.value}
                onClick={() => setCardSize(option.value)}
                className={`w-full justify-start h-auto p-3 rounded-lg transition-all ${
                  cardSize === option.value
                    ? 'bg-purple-600/80 text-white border border-purple-400/50'
                    : 'bg-purple-800/30 text-gray-200 hover:bg-purple-700/40 border border-purple-600/20'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold text-sm">{option.label}</div>
                  <div className="text-xs opacity-75">{option.desc}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {isNative && (
          <div className="mb-6 p-5 rounded-xl bg-linear-to-br from-amber-700/30 to-amber-900/10 border border-amber-600/30 backdrop-blur-md shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <BatteryCharging className="h-4 w-4 text-amber-300" />
              <h3 className="text-sm font-semibold text-amber-300">Playback Stability</h3>
            </div>
            
            <p className="text-xs text-gray-300 mb-4">Prevent app from stopping after 30 minutes on Samsung/Pixel devices.</p>

            <div className="space-y-3 mb-4">
              <Badge variant={isIgnoring ? 'default' : loading ? 'secondary' : 'destructive'}>
                {statusText}
              </Badge>

              <Progress value={progressValue} className="h-2" />

              <div className="flex gap-2">
                <Button
                  onClick={requestOptimization}
                  disabled={loading || !!isIgnoring}
                  className="flex-1 p-4 rounded-lg bg-amber-600/80 hover:bg-amber-500/90 border border-amber-400/50 text-white font-medium shadow-sm backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <div className="flex items-center justify-between w-full">
                    One-Tap Optimize
                    <ChevronRightIcon className="h-5 w-5 text-amber-200" />
                  </div>
                </Button>

                <Button
                  variant="secondary"
                  onClick={checkOptimization}
                  disabled={loading}
                  className="shrink-0"
                >
                  Refresh
                </Button>
              </div>

              <OptimizationGuide />
            </div>
          </div>
        )}

        <div className="space-y-3">
          {relevantItems.map((item) => {
            const content = (
              <>
                <div className="flex items-center gap-3">
                  <SettingsIcon
                    iconKey={item.icon || 'star'}
                    className={`h-4 w-4 ${textColorMap[item.id] || 'text-gray-400'}`}
                  />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </>
            );

            const className = `w-full justify-between h-auto p-5 rounded-xl bg-linear-to-br ${colorMap[item.id] || 'from-gray-600/30 to-gray-800/20'} backdrop-blur-sm hover:opacity-90 border border-white/10 text-gray-100`;

            return (
              <Button
                key={item.id}
                onClick={() => onItemClick(item)}
                className={className}
              >
                {content}
              </Button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">Version {APP_VERSION}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Made with ✨ by StarNoct
          </p>
        </div>
      </main>
    </div>
  );
}

const SettingsPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
};

export default SettingsPage;
