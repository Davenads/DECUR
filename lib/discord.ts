/**
 * Discord webhook notification helpers for the contribution pipeline.
 * All functions are fire-and-forget — errors are logged but do not
 * block the calling API route.
 */

interface ContributionNotification {
  id: string;
  contentType: string;
  title: string;
  submitterName: string;
  reviewUrl: string;
}

export async function notifyContributionSubmitted(
  data: ContributionNotification
): Promise<void> {
  const webhookUrl = process.env.DISCORD_CONTRIBUTION_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: 'New Contribution Submitted',
            color: 0x2e5c8a,
            fields: [
              { name: 'Type',         value: data.contentType,    inline: true },
              { name: 'Title',        value: data.title,          inline: true },
              { name: 'Submitted by', value: data.submitterName,  inline: true },
            ],
            description: `[Review in Admin Dashboard](${data.reviewUrl})`,
            footer: { text: 'DECUR Contribution Pipeline' },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (err) {
    console.error('[discord] notifyContributionSubmitted failed:', err);
  }
}

export async function notifyContributionReviewed(
  title: string,
  status: 'approved' | 'rejected' | 'needs_revision',
  reviewerNote?: string
): Promise<void> {
  const webhookUrl = process.env.DISCORD_CONTRIBUTION_WEBHOOK_URL;
  if (!webhookUrl) return;

  const colorMap: Record<string, number> = {
    approved:       0x4ea86a,
    rejected:       0xc04060,
    needs_revision: 0xc9973a,
  };

  const statusLabel = status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: `Contribution ${statusLabel}`,
            color: colorMap[status],
            description: `**${title}**${reviewerNote ? `\n\nNote: ${reviewerNote}` : ''}`,
            footer: { text: 'DECUR Contribution Pipeline' },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (err) {
    console.error('[discord] notifyContributionReviewed failed:', err);
  }
}
