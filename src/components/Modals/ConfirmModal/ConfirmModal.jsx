import "./confirmModal.css";

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
	if (!isOpen) return null;

	return (
		<div className='modalOverlay' onClick={onCancel}>
			<div className='modalCard' onClick={(e) => e.stopPropagation()}>
				<h3>{title}</h3>
				<p>{message}</p>

				<div className='modalActions'>
					<button className='modalButton cancel' onClick={onCancel}>
						Annuler
					</button>

					<button className='modalButton confirm' onClick={onConfirm}>
						Confirmer
					</button>
				</div>
			</div>
		</div>
	);
}

export default ConfirmModal;
