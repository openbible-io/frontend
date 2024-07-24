const fs = require('fs')
const glob = require('glob')
const { usfm2json } = require('usfm2json')

glob.sync('./texts/**/*.usfm').forEach(file => {
	const toPrefixPath = file
		.replace(/\.[^\/.]+$/, '')
		.replace('./texts', './static')

	console.log(`Rendering ${file} -> ${toPrefixPath}*`)
	const json = usfm2json(fs.readFileSync(file, 'utf8'))

	const toDir = toPrefixPath.replace(/\/[^\/]+$/, '')
	if (!fs.existsSync(toDir))
		fs.mkdirSync(toDir, { recursive: true })

	const { chapters, ...meta } = json
	chapters.forEach(chapter => {
		const chapterFile	= `${toPrefixPath}-${(chapter.num + 1 + '').padStart(2, '0')}.json`
		fs.writeFileSync(chapterFile, JSON.stringify({ chapter, ...meta }, null, 2))
	})
})
