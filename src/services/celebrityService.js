const WIKI_FR = "https://fr.wikipedia.org/w/api.php";
const WIKIDATA = "https://www.wikidata.org/w/api.php";

/* =========================
   Utils
========================= */

function computeAgeFromWikidataTime(timeStr) {
	if (!timeStr || typeof timeStr !== "string") return null;

	const match = timeStr.match(/^\+(\d{4})-(\d{2})-(\d{2})T/);
	if (!match) return null;

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);

	const today = new Date();
	let age = today.getFullYear() - year;

	const hadBirthday =
		today.getMonth() + 1 > month ||
		(today.getMonth() + 1 === month && today.getDate() >= day);

	if (!hadBirthday) age -= 1;
	return Number.isFinite(age) ? age : null;
}

function isHumanEntity(wdEntity) {
	const p31 = wdEntity?.claims?.P31 ?? [];
	return p31.some((c) => c?.mainsnak?.datavalue?.value?.id === "Q5");
}

function isDeceased(wdEntity) {
	const p570 = wdEntity?.claims?.P570 ?? [];
	return p570.length > 0;
}

async function fetchJson(url, params, signal) {
	const usp = new URLSearchParams(params);
	const res = await fetch(`${url}?${usp.toString()}`, { signal });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
}

/* =========================
   Main search
========================= */

export async function searchCelebrities(query, { limit = 8, signal } = {}) {
	const q = query.trim();
	if (!q) return [];

	/* 1) Wikipedia FR search */
	const searchData = await fetchJson(
		WIKI_FR,
		{
			action: "query",
			list: "search",
			srsearch: q,
			srlimit: String(limit * 2), // on élargit, car on va filtrer
			format: "json",
			origin: "*",
		},
		signal
	);

	const searchResults = searchData?.query?.search ?? [];
	const pageIds = searchResults.map((r) => r.pageid);
	if (pageIds.length === 0) return [];

	/* 2) Page props + thumbnail + QID */
	const pagesData = await fetchJson(
		WIKI_FR,
		{
			action: "query",
			prop: "pageprops|pageimages",
			ppprop: "wikibase_item|disambiguation",
			piprop: "thumbnail",
			pithumbsize: "200",
			pageids: pageIds.join("|"),
			format: "json",
			origin: "*",
		},
		signal
	);

	const pages = pagesData?.query?.pages ?? {};
	const pageInfos = pageIds
		.map((id) => pages[String(id)])
		.filter(Boolean)
		// ❌ virer les pages d’homonymie
		.filter((p) => !p?.pageprops?.disambiguation)
		// ❌ virer celles sans QID
		.filter((p) => p?.pageprops?.wikibase_item);

	const qids = pageInfos.map((p) => p.pageprops.wikibase_item);
	if (qids.length === 0) return [];

	/* 3) Wikidata: labels + claims (P31, P569) */
	const wdData = await fetchJson(
		WIKIDATA,
		{
			action: "wbgetentities",
			ids: qids.join("|"),
			props: "labels|claims",
			languages: "fr",
			format: "json",
			origin: "*",
		},
		signal
	);

	const entities = wdData?.entities ?? {};
	const defaultAvatar = "/defaultAvatar.webp";

	/* 4) Build final results (HUMANS ONLY) */
	const results = [];

	for (const p of pageInfos) {
		const qid = p.pageprops.wikibase_item;
		const wd = entities[qid];
		if (!wd) continue;

		// ✅ filtre HUMAIN
		if (!isHumanEntity(wd)) continue;

		const name = wd?.labels?.fr?.value || p.title || "Sans nom";

		const birthClaim = wd?.claims?.P569?.[0];
		const birthTime = birthClaim?.mainsnak?.datavalue?.value?.time ?? null;

		const dead = isDeceased(wd);
		const age = dead ? null : computeAgeFromWikidataTime(birthTime);

		const imageUrl = p?.thumbnail?.source || defaultAvatar;

		results.push({
			id: qid,
			name,
			age, // number | null
			isDead: dead, // ✅ NOUVEAU
			imageUrl,
			wikiTitle: p.title,
			qid,
		});

		if (results.length >= limit) break;
	}

	return results;
}
