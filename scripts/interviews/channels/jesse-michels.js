/**
 * Channel config for Jesse Michels / American Alchemy.
 * Handle: @JesseMichels  (372 videos as of Mar 2026)
 *
 * channelId is resolved automatically from channelHandle if left null.
 * To hard-code after first run: set channelId to the value printed during fetch.
 */
module.exports = {
  channelId:     null,                             // resolved via handle on first run
  channelHandle: 'JesseMichels',                   // without @
  channelName:   'Jesse Michels',
  channelUrl:    'https://www.youtube.com/@JesseMichels',
  hostName:      'Jesse Michels',

  // Extraction hints: patterns Claude uses when guest name can't be parsed from title
  hostAliases:   ['Jesse', 'Jesse Michels'],

  // Title parse strategies for extracting the guest name.
  // Tried in order; first match wins.
  // Supported patterns: 'colon-suffix', 'with-keyword', 'pipe-suffix'
  titleParseStrategies: ['colon-suffix', 'pipe-suffix', 'with-keyword'],
};
