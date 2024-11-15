export default async function hash(
	data: string | BufferSource,
): Promise<string> {
	if (typeof data == "string") data = new TextEncoder().encode(data);

	const buffer = await crypto.subtle.digest("sha-256", data);
	const arr = Array.from(new Uint8Array(buffer));
	return arr.map((i) => i.toString(16).padStart(2, "0")).join("");
}
