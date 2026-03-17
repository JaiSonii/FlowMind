'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Sparkles, Copy, Check } from 'lucide-react'

interface StandupSummaryCardProps {
  projectId: string
}

export function StandupSummaryCard({ projectId }: StandupSummaryCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    setSummary(null)

    try {
      const response = await fetch('/api/ai/standup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!summary) {
    return (
      <Card className="p-6 border border-border bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Daily Standup Summary
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Generate an AI-powered summary of your project's progress.
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border border-border bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Today's Standup
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {summary}
        </p>
      </div>

      <Button
        onClick={() => setSummary(null)}
        variant="outline"
        size="sm"
        className="mt-4"
      >
        Generate Another
      </Button>
    </Card>
  )
}
