
import fs from 'fs'
import path from 'path'
const dataDir = path.join(process.cwd(), 'data')
export function readJSON(name){ return JSON.parse(fs.readFileSync(path.join(dataDir, name),'utf-8')) }
export function writeJSON(name, data){ fs.writeFileSync(path.join(dataDir, name), JSON.stringify(data,null,2)) }
