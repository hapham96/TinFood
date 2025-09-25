const ConfirmModal = ({ isOpen, onClose, onConfirm, restaurant }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-[#faf2e4] rounded-2xl shadow-lg p-6 w-80 text-center">
        <h2 className="text-xl font-semibold text-[#6b4f4f] mb-4">
          Confirmation
        </h2>
        <p className="text-[#6b4f4f] mb-6">
          Would you like to direct to <b>{restaurant?.name}</b> right now?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-300 text-[#6b4f4f] hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-[#6b4f4f] text-white hover:bg-[#553939]"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
