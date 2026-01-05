import "./bingoCell.css";

function BingoCell({ text, imageUrl, onClick, isUnder60, isOver85 }) {
	return (
		<div
			className={`bingoCell
        ${isUnder60 ? "bingoCellUnder60" : ""}
        ${isOver85 ? "bingoCellOver85" : ""}
      `}
			onClick={onClick}
		>
			<img className='bingoCellImg' src={imageUrl} alt={text} />
			<span className='bingoCellText'>{text}</span>
		</div>
	);
}

export default BingoCell;
