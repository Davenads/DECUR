/**
 * Channel config for That UFO Podcast by Andy McGrillen.
 * Handle: @ThatUFOPodcast  (~590+ videos as of Mar 2026)
 *
 * Pure interview format, UK-based host, long-form 1-on-1 episodes.
 * One of the largest UAP interview back catalogs available.
 *
 * channelId is resolved automatically from channelHandle if left null.
 * To hard-code after first run: set channelId to the value printed during fetch.
 */
module.exports = {
  channelId:     'UCHw9Lru3EcpRQyM7AI5TlmA',
  channelHandle: 'ThatUFOPodcast',             // without @
  channelName:   'That UFO Podcast',
  channelUrl:    'https://www.youtube.com/@ThatUFOPodcast',
  hostName:      'Andy McGrillen',

  // Extraction hints: patterns Claude uses when guest name can't be parsed from title
  hostAliases:   ['Andy', 'Andy McGrillen', 'McGrillen'],

  // Title parse strategies for extracting the guest name.
  // Tried in order; first match wins.
  // Supported patterns: 'colon-suffix', 'with-keyword', 'pipe-suffix'
  titleParseStrategies: ['colon-suffix', 'pipe-suffix', 'with-keyword'],
};
