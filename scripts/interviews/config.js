/**
 * Interviews pipeline config factory.
 *
 * Reads --channel <slug> from process.argv, loads the matching channel
 * config from ./channels/<slug>.js, and merges it with shared path and
 * rate-limit defaults.
 *
 * Usage from any script:
 *   const cfg = require('./config');
 *   // cfg.channelId, cfg.indexFile, cfg.hostName, etc. are all available
 */
const path = require('path');

function getChannelSlug() {
  const idx = process.argv.indexOf('--channel');
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error('Error: --channel <slug> is required.');
    console.error('Example: node scripts/interviews/fetch-channel.js --channel jesse-michels');
    process.exit(1);
  }
  return process.argv[idx + 1];
}

const slug       = getChannelSlug();
const channelCfg = require(`./channels/${slug}`);
const basePath   = path.join(__dirname, '../../data/channels/interviews', slug);

module.exports = {
  // Merged channel-specific fields
  ...channelCfg,

  // Channel slug (for labeling output)
  channelSlug: slug,

  // Resolved data paths
  indexFile:        path.join(basePath, 'index.json'),
  transcriptsDir:   path.join(basePath, 'transcripts'),
  extractedDir:     path.join(basePath, 'extracted'),
  approvedDir:      path.join(basePath, 'approved'),
  contributionsDir: path.join(basePath, 'contributions'),

  // Shared extraction config
  extractionModel: 'claude-opus-4-5',

  // Rate limiting between API calls (ms)
  transcriptDelay:  800,
  extractionDelay: 1200,
};
