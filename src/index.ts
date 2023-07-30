import * as core from '@actions/core'
import {action} from './action'

action().catch(error => {
  console.log(`error: ${error}`)
  console.log(`core is null?: ${core == null}`)
  core.setFailed(error.message)
})
