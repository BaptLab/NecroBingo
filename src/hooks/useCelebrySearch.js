import { useEffect, useRef, useState } from "react";
import { searchCelebrities } from "../services/celebrityService";

export function useCelebritySearch(query) {
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const requestIdRef = useRef(0);
	const abortRef = useRef(null);

	useEffect(() => {
		const q = query.trim();

		// reset if empty
		if (!q) {
			setResults([]);
			setLoading(false);
			setError("");
			// cancel pending
			if (abortRef.current) abortRef.current.abort();
			return;
		}

		setLoading(true);
		setError("");

		// debounce
		const t = setTimeout(async () => {
			// cancel previous request
			if (abortRef.current) abortRef.current.abort();
			const controller = new AbortController();
			abortRef.current = controller;

			const myId = ++requestIdRef.current;

			try {
				const data = await searchCelebrities(q, {
					limit: 8,
					signal: controller.signal,
				});

				// ignore outdated responses
				if (myId !== requestIdRef.current) return;

				setResults(data);
			} catch (e) {
				if (controller.signal.aborted) return;
				setError("Erreur de recherche (Wikipedia/Wikidata).");
				setResults([]);
			} finally {
				if (myId === requestIdRef.current) setLoading(false);
			}
		}, 350);

		return () => {
			clearTimeout(t);
		};
	}, [query]);

	return { results, loading, error };
}
