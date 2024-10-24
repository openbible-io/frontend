/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly OPENBIBLE_COMMIT: string;
	readonly OPENBIBLE_COMMIT_DATE: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
