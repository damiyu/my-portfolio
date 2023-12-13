export async function getJSON(url) {
	const { default: json } = await import(url, { assert: { type: 'json' } });
	return json;
}