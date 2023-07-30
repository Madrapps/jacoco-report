// @ts-nocheck
import core from '@actions/core'
import action from './action'

action.action().catch(error => {
  core.setFailed(error.message)
})
