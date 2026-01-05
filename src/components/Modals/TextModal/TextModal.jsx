import "./textModal.css";

function TextModal({ isOpen, onClose }) {
	if (!isOpen) return null;

	return (
		<div className='modalOverlay' onClick={onClose}>
			<div className='modalCard' onClick={(e) => e.stopPropagation()}>
				<div className='modalHeader'>
					<h3>Règles</h3>
					<button className='modalClose' onClick={onClose}>
						X
					</button>
				</div>

				<div className='rulesContent'>
					{" "}
					<p>
						<strong>NecroBingo</strong> est un jeu de pari morbide
						mais stratégique. Tu remplis ta grille avec des
						personnalités vivantes… puis tu attends.
					</p>
					<br></br>
					<h4>🧮 Calcul du score</h4> <br></br>
					<p>
						Le score de base correspond au nombre de jours écoulés
						entre la <strong>date de création de ton bingo</strong>{" "}
						et la <strong>date de décès</strong> de la personnalité.
					</p>
					<p>
						Exemple : ton bingo a été créé il y a 50 jours, la
						personne décède aujourd’hui → <strong>50 points</strong>
						.
					</p>{" "}
					<br></br>
					<h4>🎲 Prise de risque : bonus et malus</h4>
					<ul>
						<li>
							<strong>Moins de 60 ans</strong> — pari risqué
							(cadre rouge):
							<br />
							👉 <strong>score ×2</strong>
							<br />
							Exemple : 50 points → <strong>100 points</strong>.
						</li>

						<li>
							<strong>Plus de 85 ans</strong> — pari facile (cadre
							bleu) :
							<br />
							👉 <strong>score ÷2</strong>
							<br />
							Exemple : 50 points → <strong>25 points</strong>.
						</li>
					</ul>{" "}
					<br></br>
					<h4>☠️ Règles importantes</h4>
					<ul>
						<li>
							Lorsque le bingo est téléchargé ou partager, un
							tampon avec la date y sera apposé pour empêcher
							toute triche !
						</li>
						<li>
							Les personnes déjà décédées sont grisées et non
							sélectionnables.
						</li>

						<li>
							Cliquer sur une case remplie permet de supprimer la
							personnalité.
						</li>
						<li>
							La grille peut être exportée ou téléchargée à tout
							moment.
						</li>
					</ul>
				</div>

				<div className='modalActions'>
					<button className='modalButton confirm' onClick={onClose}>
						OK
					</button>
				</div>
			</div>
		</div>
	);
}

export default TextModal;
