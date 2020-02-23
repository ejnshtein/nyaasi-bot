import dotevn from 'dotenv'
import dotenvParseVariables from 'dotenv-parse-variables'
import argv from './lib/argv.js'
if (!process.env) {
  const env = dotevn.config({
    path: './.env'
  })
  const variables = dotenvParseVariables(env.parsed)
  process.env = variables
} else {
  if (!argv('--heroku')) {
    const env = dotevn.config({
      path: './.env'
    })
    const variables = dotenvParseVariables(env.parsed)
    process.env = {
      ...process.env,
      ...variables
    }
  }
}

export default process.env
