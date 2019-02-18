module.exports = app => {
  require('./start')(app)
  require('./search')(app)
  require('./about')(app)
  require('./count')(app)
  require('./source')(app)
  require('./link-detector')(app)
}
