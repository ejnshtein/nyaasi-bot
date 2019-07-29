module.exports = app => {
  require('./search')(app)
  require('./inline-query')(app)
  require('./magnet')(app)
  require('./torrent')(app)
  require('./download-torrent-file')(app)
  require('./get-torrent-files')(app)
  require('./delete')(app)
  require('./file-chooser')(app)
}
