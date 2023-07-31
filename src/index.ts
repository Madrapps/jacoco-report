import * as core from '@actions/core'
import {action} from './action'

action().catch(error => {
  core.setFailed(error.message)
})
