import { handleRequest } from '../../lib/server.js'

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request)
  }
}