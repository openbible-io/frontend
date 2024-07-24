import { ParagraphType, VerseType } from "."

type Visitor = (verse: VerseType, parent?: ParagraphType) => void

const visit = (
	verse: ParagraphType | VerseType,
	visitor: Visitor,
	parent?: ParagraphType
) => {
	visitor(verse, parent)
	if (Array.isArray(verse.v)) {
		(verse as ParagraphType).v.forEach(v => visit(v, visitor, verse as ParagraphType))
	}
}

export const visitParagraphs = (
	paragraphs: ParagraphType[] | undefined,
	visitor:Visitor
) => {
	if (!paragraphs) {
		return
	}
	paragraphs.forEach(p => visit(p, visitor))
}