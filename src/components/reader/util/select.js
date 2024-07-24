import { getLocalSetting } from '../../../utils/settings'
import styles from './select.css'

// Handles selecting anywhere in <article> of <Reader>
const selectableTags = ['SPAN']
const selectedNodes = []
const paragraphStyles = [
	'padding',
	'margin',
	'font-family',
	'font-size',
	'text-indent',
]
const spanStyles = [
	'color',
	'background-color',
]

function snapToWords(range) {
	range.setStart(range.startContainer, 0)
	if (range.endContainer.length) {
		range.setEnd(range.endContainer, range.endContainer.length)
	}
}

function createNodeIterator(node) {
	return document.createNodeIterator(
		node,
		NodeFilter.SHOW_ALL
	)
}

function trySelectNode(node, tags) {
	if (tags.includes(node.nodeName)) {
		node.classList.add(styles.isSelected)
		selectedNodes.push(node)
	}
}

// Select API doesn't yet allow selecting multiple ranges
// Just traverse selected Range and add a class to tags
function iterateOverRange(range, rangeFn) {
	const it = createNodeIterator(range.commonAncestorContainer)
	let hitFirstNode = false
	for (let node = it.referenceNode;; node = it.nextNode()) {
		if (!hitFirstNode && node === range.startContainer) {
			hitFirstNode = true
		} else if (!hitFirstNode || !node) {
			continue
		}

		rangeFn(node)

		if (node === range.endContainer) {
			break
		}
	}
}

function selectTags(selection, tags) {
	for (let i = 0; i < selection.rangeCount; i++) {
		iterateOverRange(selection.getRangeAt(i), node => {
			trySelectNode(node, tags)
			trySelectNode(node.parentNode, tags)
		})
	}
}

export function onSelectChange() {
	const selection = window.getSelection()
	if (selection.rangeCount === 0) {
		return
	}
	const range = selection.getRangeAt(0)
	if (range.startContainer === range.endContainer &&
			range.startOffset === range.endOffset) {
		return
	}
	snapToWords(range)
	// Unselect all previously selected nodes
	selectedNodes.forEach(node => node.classList.remove(styles.isSelected))
	selectedNodes.length = 0
	selectTags(selection, selectableTags)
}

// TODO
export function onDoubleClickVerseNumber(ev) {
  ev.preventDefault()
}

function getStyles(node) {
	const nodeStyles = getComputedStyle(node)
	if (node.nodeName === 'P') {
		return paragraphStyles
			.map(style => `${style}: ${nodeStyles[style]};`)
			.join(' ')
	}
	else if (node.nodeName === 'SPAN') {
		return spanStyles
			.map(style => `${style}: ${nodeStyles[style]};`)
			.join(' ')
	}

	return ''
}

export function onCopy(ev) {
	if (getLocalSetting('selectVerseNums') === 'default') {
		return
	}
	const range = document.getSelection().getRangeAt(0)
	let toCopy = ''
	let toCopyHTML = '<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><meta charset="utf-8">'
	let addedFirstPara = false
	iterateOverRange(range, node => {
		const parentNode = node.parentNode
		if (node.nodeName === '#text'
				&& selectableTags.includes(parentNode.nodeName)) {
			toCopy += node.textContent
			if (!addedFirstPara) {
				toCopyHTML += `<p style="${getStyles(parentNode.parentNode)}">`
				addedFirstPara = true
			}
			toCopyHTML += `<span style="${getStyles(parentNode)}">${node.textContent}</span>`
		}
		else if (node.nodeName === 'P') {
			toCopy += '\n'
			toCopyHTML += `</p><p style="${getStyles(node)}">`
		}
		else if (node.nodeName === 'SUP') {
			toCopy += ' '
			toCopyHTML += ' '
		}
	})
	toCopyHTML += '</p></body></html>'
	ev.clipboardData.setData('text/html', toCopyHTML)
	ev.clipboardData.setData('text/plain', toCopy)
	ev.preventDefault()
}
