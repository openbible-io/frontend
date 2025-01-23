export default async function hashFn(
	data: string | BufferSource,
): Promise<string> {
	if (typeof data == "string") data = new TextEncoder().encode(data);

	const buffer = await crypto.subtle.digest("sha-256", data);
	const arr = Array.from(new Uint8Array(buffer));
    const string = arr.map(c => String.fromCharCode(c)).join("");

	return "sha256-" + btoa(string);
}
