const dotenv = require('dotenv')
const dotenvParseVariables = require('dotenv-parse-variables')
const env = dotenv.config({
  path: './.env'
})
process.env = dotenvParseVariables(env.parsed)

process.env.HOST = process.env.HOST || 'nyaa.si'
