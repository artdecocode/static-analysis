import staticAnalysis from '../../src'
import { detect } from '../../src/lib'

/** @type {Object.<string, ()} */
const TS = {
  async 'detects the matches'() {
    return await detect('test/fixture/detect.js')
    // const packages = res.reduce((acc, current) => {
    //   const { internal, version, name } = current
    //   if (internal) return acc
    //   const key = `${name}-${version}`
    //   if (!(key in acc)) acc[key] = []
    //   acc[key].push(current)
    //   return acc
    // }, {})
  },
  async 'filters duplicates'() {
    return await staticAnalysis('test/fixture/detect.js')
  },
  async 'has main'() {
    return await staticAnalysis('test/fixture/lib/has-main.js')
  },
  async 'read with dot'() {
    return await staticAnalysis('test/fixture/dot/dot.js')
  },
  async 'ignores node_modules'() {
    return await staticAnalysis('test/fixture/no-node-modules.js', {
      nodeModules: false,
    })
  },
  async 'shallow node_modules'() {
    return await staticAnalysis('test/fixture/shallow.js', {
      shallow: true,
    })
  },
  async 'soft mode'() {
    return await staticAnalysis('test/fixture/soft.js', {
      soft: true,
    })
  },
  async 'allows to pass resolvable path'() {
    return await staticAnalysis('test/fixture', {
      shallow: true,
    })
  },
}

export default TS