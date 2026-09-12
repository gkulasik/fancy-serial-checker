import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const distDir = new URL('../dist', import.meta.url)
const distPath = distDir.pathname
const assetsPath = join(distPath, 'assets')
const indexPath = join(distPath, 'index.html')
const faviconPath = join(distPath, 'favicon.svg')

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

assert(existsSync(indexPath), 'Missing dist/index.html')
assert(existsSync(assetsPath), 'Missing dist/assets directory')
assert(statSync(assetsPath).isDirectory(), 'dist/assets is not a directory')
assert(existsSync(faviconPath), 'Missing dist/favicon.svg')

const assetFiles = readdirSync(assetsPath)
assert(assetFiles.length > 0, 'dist/assets is empty')
assert(assetFiles.some((name) => name.endsWith('.js')), 'dist/assets does not contain a JS bundle')
assert(assetFiles.some((name) => name.endsWith('.css')), 'dist/assets does not contain a CSS bundle')

const indexHtml = readFileSync(indexPath, 'utf8')
assert(indexHtml.includes('./assets/') || indexHtml.includes('assets/'), 'dist/index.html does not reference built assets')

console.log('dist verification passed')
console.log(`assets: ${assetFiles.join(', ')}`)
