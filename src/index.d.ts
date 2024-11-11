interface ImportMetaEnv {
	readonly PROD: boolean;
	readonly DEV: boolean;
	readonly OPENBIBLE_VERSION: string;
	readonly OPENBIBLE_VERSION_DATE: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
