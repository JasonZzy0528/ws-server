/*
globals module
*/
module.exports = {

  // the address you want to bind to, :: means all ipv4 and ipv6 addresses
  // this may not work on all operating systems
  host: '::',

  /*  it is assumed that your websocket will bind to the same port as http
  *  you can override this behaviour by supplying a number via websocketPort
  */
  port: 3000,

  /* The URL which must be hit in order to get a websocket connection.
  * Any other URL will fail with an error.
  */
  websocketPath: '/cryptpad_websocket',

  /*  Cryptpad can log activity to stdout
  *  This may be useful for debugging
  */
  logToStdout: false,

  /*  Cryptpad supports verbose logging
  *  (false by default)
  */
  verbose: false,

  /*
  You have the option of specifying an alternative storage adaptor.
  These status of these alternatives are specified in their READMEs,
  which are available at the following URLs:
  mongodb: a noSQL database
  https://github.com/xwiki-labs/cryptpad-mongo-store
  amnesiadb: in memory storage
  https://github.com/xwiki-labs/cryptpad-amnesia-store
  leveldb: a simple, fast, key-value store
  https://github.com/xwiki-labs/cryptpad-level-store
  sql: an adaptor for a variety of sql databases via knexjs
  https://github.com/xwiki-labs/cryptpad-sql-store
  For the most up to date solution, use the default storage adaptor.
  */
  storage: './storage/file',

  /*
  Cryptpad stores each document in an individual file on your hard drive.
  Specify a directory where files should be stored.
  It will be created automatically if it does not already exist.
  */
  filePath: './datastore/',

  /*  Cryptpad's file storage adaptor closes unused files after a configurale
  *  number of milliseconds (default 30000 (30 seconds))
  */
  channelExpirationMs: 30000,

  /*  Cryptpad's file storage adaptor is limited by the number of open files.
  *  When the adaptor reaches openFileLimit, it will clean up older files
  */
  openFileLimit: 2048,

  /* If true, channels will be deleted entirely after they have not been used
  * for some time (channelRemovalTimeout)
  */
  removeChannels: false,

  /* If removeChannels is true, the number of milliseconds to wait between the
  * last person leaving the channel and the time when it is deleted.
  */
  channelRemovalTimeout: 60000,
  websocketURL: 'ws://localhost:3000/cryptpad_websocket'
}
