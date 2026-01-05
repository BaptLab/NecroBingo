import "./bingoGrid.css";

import { useState, useEffect, useRef } from "react";
import * as htmlToImage from "html-to-image";

import BingoCell from "../BingoCell/BingoCell";
import SearchModal from "../../Modals/SearchModal/SearchModal";
import ConfirmModal from "../../Modals/ConfirmModal/ConfirmModal";
import TextModal from "../../Modals/textModal/TextModal";

/* =====================
   Helpers / constants
===================== */

const STORAGE_KEY = "necroBingo.cells.v1";
const getNowISO = () => new Date().toISOString();

const createEmptyGrid = () =>
	Array.from({ length: 25 }, (_, index) => ({
		id: index,
		celebrity: null,
	}));

/* =====================
   Component
===================== */

function BingoGrid() {
	/* REFS */
	const gridRef = useRef(null);

	/* STATES */
	const [isRulesOpen, setIsRulesOpen] = useState(false);
	const [activeCellId, setActiveCellId] = useState(null);
	const [cellToDeleteId, setCellToDeleteId] = useState(null);
	const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

	const [lastUpdatedAt, setLastUpdatedAt] = useState(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				return parsed.lastUpdatedAt || getNowISO();
			} catch {}
		}
		return getNowISO();
	});

	const [cells, setCells] = useState(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				// compat ancienne version
				if (Array.isArray(parsed)) return parsed;
				return parsed.cells || createEmptyGrid();
			} catch {}
		}
		return createEmptyGrid();
	});

	/* =====================
	   EVENTS
	===================== */

	const handleSelectCelebrity = (celebrity) => {
		if (activeCellId === null) return;

		setCells((prevCells) =>
			prevCells.map((cell) =>
				cell.id === activeCellId ? { ...cell, celebrity } : cell
			)
		);

		setActiveCellId(null);
	};

	const handleCellClick = (index) => {
		if (cells[index].celebrity !== null) {
			setCellToDeleteId(index);
			return;
		}
		setActiveCellId(index);
	};

	const handleConfirmDeleteCell = () => {
		if (cellToDeleteId === null) return;

		setCells((prevCells) =>
			prevCells.map((cell) =>
				cell.id === cellToDeleteId ? { ...cell, celebrity: null } : cell
			)
		);

		setCellToDeleteId(null);
	};

	const handleResetGrid = () => {
		setCells(createEmptyGrid());
		setActiveCellId(null);
	};

	/* =====================
	   EXPORT / SHARE
	===================== */

	const generatePngBlob = async () => {
		const node = gridRef.current;
		if (!node) throw new Error("Grid ref not found");

		const blob = await htmlToImage.toBlob(node, {
			pixelRatio: 2,
			backgroundColor: "#0c0c0c",
		});

		if (!blob) throw new Error("Failed to generate PNG");
		return blob;
	};

	const handleDownloadPng = async () => {
		try {
			const blob = await generatePngBlob();
			const url = URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = "necro-bingo.png";
			document.body.appendChild(a);
			a.click();
			a.remove();

			URL.revokeObjectURL(url);
		} catch (err) {
			console.error(err);
			alert("Impossible de générer l'image.");
		}
	};

	const handleSharePng = async () => {
		try {
			const blob = await generatePngBlob();
			const file = new File([blob], "necro-bingo.png", {
				type: "image/png",
			});

			if (navigator.canShare && navigator.canShare({ files: [file] })) {
				await navigator.share({
					title: "Mon NecroBingo",
					text: "Voici ma grille !",
					files: [file],
				});
				return;
			}

			await handleDownloadPng();
		} catch (err) {
			console.error(err);
			alert("Partage impossible sur cet appareil/navigateur.");
		}
	};

	/* =====================
	   PERSISTENCE
	===================== */

	useEffect(() => {
		const now = getNowISO();
		setLastUpdatedAt(now);

		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				lastUpdatedAt: now,
				cells,
			})
		);
	}, [cells]);

	/* =====================
	   RENDER
	===================== */

	return (
		<>
			<div className='bingoGrid' ref={gridRef}>
				{/* Tampon visible + exporté */}
				<div className='bingoStamp'>
					NecroBingo •{" "}
					{new Date(lastUpdatedAt).toLocaleString("fr-FR", {
						day: "2-digit",
						month: "2-digit",
						year: "numeric",
					})}
				</div>

				{cells.map((cell) => {
					const isEmpty = cell.celebrity === null;
					const celeb = cell.celebrity;

					const isUnder60 =
						!!celeb &&
						!celeb.isDead &&
						typeof celeb.age === "number" &&
						celeb.age < 60;

					const isOver85 =
						!!celeb &&
						!celeb.isDead &&
						typeof celeb.age === "number" &&
						celeb.age > 85;

					return (
						<BingoCell
							key={cell.id}
							text={isEmpty ? "Cliquer pour choisir" : celeb.name}
							imageUrl={
								isEmpty ? "/defaultAvatar.webp" : celeb.imageUrl
							}
							isUnder60={isUnder60}
							isOver85={isOver85}
							onClick={() => handleCellClick(cell.id)}
						/>
					);
				})}
			</div>

			<div className='gridActions'>
				<button
					className='gridButton resetGridButton'
					onClick={() => setIsConfirmResetOpen(true)}
				>
					Vider la grille
				</button>

				<button
					className='gridButton exportGridButton'
					onClick={handleSharePng}
				>
					Exporter / Partager
				</button>

				<button
					className='gridButton downloadGridButton'
					onClick={handleDownloadPng}
				>
					Télécharger
				</button>

				<button
					className='gridButton rulesGridButton'
					onClick={() => setIsRulesOpen(true)}
				>
					Règles
				</button>
			</div>

			<SearchModal
				isOpen={activeCellId !== null}
				onClose={() => setActiveCellId(null)}
				onSelect={handleSelectCelebrity}
			/>

			<ConfirmModal
				isOpen={isConfirmResetOpen}
				title='Vider la grille'
				message='Es-tu sûr de vouloir vider complètement la grille ? Cette action est irréversible.'
				onCancel={() => setIsConfirmResetOpen(false)}
				onConfirm={() => {
					handleResetGrid();
					setIsConfirmResetOpen(false);
				}}
			/>

			<ConfirmModal
				isOpen={cellToDeleteId !== null}
				title='Supprimer la célébrité'
				message='Souhaitez-vous supprimer cette célébrité de la case ?'
				onCancel={() => setCellToDeleteId(null)}
				onConfirm={handleConfirmDeleteCell}
			/>

			<TextModal
				isOpen={isRulesOpen}
				onClose={() => setIsRulesOpen(false)}
			/>
		</>
	);
}

export default BingoGrid;
