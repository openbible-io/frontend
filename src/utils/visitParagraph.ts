import { ParagraphType, VerseType } from "."

const visit = (
	verse: ParagraphType | VerseType,
	visitor: (verse: VerseType) => void
) => {
	visitor(verse)
	if (Array.isArray(verse.v)) {
		(verse as ParagraphType).v.forEach(v => visit(v, visitor))
	}
}

export const visitParagraphs = (
	paragraphs: ParagraphType[] | undefined,
	visitor: (verse: VerseType) => void
) => {
	if (!paragraphs) {
		return
	}
	paragraphs.forEach(p => visit(p, visitor))
}