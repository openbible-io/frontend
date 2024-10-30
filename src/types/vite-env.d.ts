/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly PROD: boolean;
	readonly DEV: boolean;
	readonly OPENBIBLE_COMMIT: string;
	readonly OPENBIBLE_COMMIT_DATE: string;
	readonly OPENBIBLE_CACHE_FOREVER_REGEX: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
