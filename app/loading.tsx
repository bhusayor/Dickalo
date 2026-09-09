import { Container } from '@/components/common/Container';

/**
 * Global loading state.
 *
 * A skeleton rather than a spinner: it holds the shape of the page that is
 * coming, so the transition lands rather than snapping into place. No text —
 * a message that flashes for 200ms is noise, not information.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-base pt-32" role="status" aria-label="Loading">
      <Container className="py-section">
        <div className="flex flex-col gap-6">
          <div className="h-3 w-32 animate-pulse rounded-xs bg-line" />
          <div className="h-16 w-full max-w-3xl animate-pulse rounded-sm bg-line" />
          <div
            className="h-16 w-full max-w-2xl animate-pulse rounded-sm bg-line"
            style={{ animationDelay: '120ms' }}
          />
          <div
            className="mt-6 h-4 w-full max-w-xl animate-pulse rounded-xs bg-line-subtle"
            style={{ animationDelay: '200ms' }}
          />
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex flex-col gap-4">
              <div
                className="aspect-[3/2] w-full animate-pulse rounded-md bg-line"
                style={{ animationDelay: `${index * 100}ms` }}
              />
              <div className="h-5 w-2/3 animate-pulse rounded-xs bg-line-subtle" />
              <div className="h-4 w-1/2 animate-pulse rounded-xs bg-line-subtle" />
            </div>
          ))}
        </div>
      </Container>

      <span className="sr-only">Loading the page</span>
    </div>
  );
}
