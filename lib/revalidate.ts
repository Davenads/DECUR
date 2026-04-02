/**
 * ISR revalidation helper.
 * Called after a contribution is approved to immediately refresh
 * the affected static pages without a full redeploy.
 */

type ContentType = 'figure' | 'case' | 'document' | 'program' | 'timeline_event';

export async function revalidateContentPaths(
  contentType: ContentType,
  contentId?: string
): Promise<void> {
  const paths: string[] = ['/data', '/explore', '/search'];

  if (contentId) {
    const pathMap: Record<ContentType, string | null> = {
      figure:         `/figures/${contentId}`,
      case:           `/cases/${contentId}`,
      document:       `/documents/${contentId}`,
      program:        `/programs/${contentId}`,
      timeline_event: '/timeline',
    };
    const specificPath = pathMap[contentType];
    if (specificPath) paths.push(specificPath);
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  await Promise.allSettled(
    paths.map((path) =>
      fetch(`${baseUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.REVALIDATE_SECRET,
          path,
        }),
      }).catch((err) => {
        console.error(`[revalidate] failed for path ${path}:`, err);
      })
    )
  );
}
