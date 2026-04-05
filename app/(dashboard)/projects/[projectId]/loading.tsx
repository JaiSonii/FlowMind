import { Spinner } from '@/components/ui/spinner'

export default function ProjectLoading() {
  return (
    <div className="p-6 md:p-8 flex items-center justify-center h-96">
      <Spinner className="mr-2 h-8 w-8 text-indigo-600" />
      <span className="text-muted-foreground">Loading project...</span>
    </div>
  )
}