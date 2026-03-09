/**
 * UAP Gerb channel pipeline configuration.
 */
const path = require('path');

module.exports = {
  channelId:   'UCXr8USOuzZN_3y_efZpryrg',
  channelName: 'UAP Gerb',
  channelUrl:  'https://www.youtube.com/@uapgerb',

  // Paths
  indexFile:         path.join(__dirname, '../../data/channels/gerb/index.json'),
  transcriptsDir:    path.join(__dirname, '../../data/channels/gerb/transcripts'),
  extractedDir:      path.join(__dirname, '../../data/channels/gerb/extracted'),
  approvedDir:       path.join(__dirname, '../../data/channels/gerb/approved'),
  contributionsDir:  path.join(__dirname, '../../data/channels/gerb/contributions'),

  // Extraction config
  extractionModel: 'claude-opus-4-5',

  // Rate limiting between API calls (ms)
  transcriptDelay:  800,
  extractionDelay: 1200,
};
