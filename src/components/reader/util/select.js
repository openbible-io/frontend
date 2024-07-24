import styles from './select.css'

// Handles selecting anywhere in <article> of <Reader>
const selectableTags = ['SPAN']
const selectedNodes = []

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

// TODO
export function onCopy(ev) {
	const range = document.getSelection().getRangeAt(0)
	let toCopy = ''
	iterateOverRange(range, node => {
		if (selectableTags.includes(node.parentNode.nodeName)) {
			toCopy += node.textContent
		}
	})
	ev.clipboardData.setData('text/plain', toCopy)
	ev.preventDefault()
}
