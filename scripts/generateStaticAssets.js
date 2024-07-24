const fs = require('fs')
const glob = require('glob')
const { usfm2json } = require('usfm2json')

glob.sync('./texts/**/*.usfm').forEach(file => {
	const toFile = file
		.replace(/\.[^\/.]+$/, '')
		.replace(/\d\d-/, '')
		.replace('./texts', './static') + '.json'
	console.log('Rendering', file, '->', toFile)
	const json = usfm2json(fs.readFileSync(file, 'utf8'))

	const toDir = toFile.replace(/\/[^\/]+$/, '')
	if (!fs.existsSync(toDir))
		fs.mkdirSync(toDir, { recursive: true })
	fs.writeFileSync(toFile, JSON.stringify(json, null, 2))
})
