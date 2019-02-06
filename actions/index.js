module.exports = app => {
  require('./search')(app)
  require('./inline-query')(app)
  require('./magnet')(app)
  require('./download')(app)
  require('./torrent')(app)
}
