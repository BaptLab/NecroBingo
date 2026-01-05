import "./searchModal.css";
import { useState } from "react";
import { useCelebritySearch } from "../../../hooks/useCelebrySearch.js";

const SearchModal = ({ isOpen, onClose, onSelect }) => {
	const [query, setQuery] = useState("");
	const { results, loading, error } = useCelebritySearch(query);

	if (!isOpen) return null;

	return (
		<div className='modalOverlay' onClick={onClose}>
			<div className='modalCard' onClick={(e) => e.stopPropagation()}>
				<div className='modalHeader'>
					<h3>Rechercher une célébrité</h3>
					<button onClick={onClose}>X</button>
				</div>

				<input
					className='modalInput'
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder='Tape un nom (ex: darmanin)…'
					autoFocus
				/>

				<div className='results'>
					{loading ? (
						<div className='emptyResult'>Recherche…</div>
					) : error ? (
						<div className='emptyResult'>{error}</div>
					) : results.length === 0 ? (
						<div className='emptyResult'>Aucun résultat</div>
					) : (
						results.map((result) => (
							<button
								key={result.id}
								className={`resultItem ${
									result.isDead ? "dead" : ""
								}`}
								onClick={() => {
									if (!result.isDead) onSelect(result);
								}}
								disabled={result.isDead}
							>
								<img
									className='resultImg'
									src={result.imageUrl}
									alt={result.name}
								/>
								<span className='resultName'>
									{result.name}
									{result.isDead
										? " †"
										: typeof result.age === "number"
										? ` • ${result.age} ans`
										: ""}
								</span>
							</button>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default SearchModal;
