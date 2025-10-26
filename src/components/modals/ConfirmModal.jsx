import React from "react";

/**
 * A reusable confirmation modal component.
 *
 * @param {boolean} isOpen - Controls whether the modal is visible.
 * @param {string} text - The main message/question to display.
 * @param {string} [title='Confirmation'] - Optional title for the modal.
 * @param {function} onClose - Function to call when the modal is closed (via overlay click, close button, or Cancel button).
 * @param {function} onConfirm - Function to call when the Confirm/OK button is clicked.
 * @param {boolean} [isAlertMode=false] - If true, hides the Cancel button and changes Confirm text to 'OK' by default.
 * @param {string} [confirmText] - Custom text for the confirm button. Defaults to 'OK' in alert mode, 'Confirm' otherwise.
 * @param {string} [cancelText='Cancel'] - Custom text for the cancel button.
 */
export default function ConfirmModal({
  isOpen,
  text,
  title = "Confirmation", // Default title
  onClose,
  onConfirm,
  isAlertMode = false, // Default to false
  confirmText,
  cancelText = "Cancel", // Default cancel text
}) {
  // Determine the confirm button text based on mode or prop
  const finalConfirmText = confirmText ?? (isAlertMode ? "OK" : "Confirm");

  // Return null if the modal should not be open
  if (!isOpen) {
    return null;
  }

  return (
    // Overlay
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm" // Added backdrop-blur-sm
      onClick={onClose} // Close on overlay click
    >
      {/* Modal Container */}
      <div
        className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4 text-[#4b2e19] animate-fadeIn" // White bg, max-w-sm
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button (optional, but good practice) */}
        {!isAlertMode && ( // Hide close button in alert mode for simplicity
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 text-2xl hover:text-[#c14564] transition"
            aria-label="Close"
          >
            &times;
          </button>
        )}

        {/* Title - Primary color */}
        {title && (
          <h3 className="text-lg font-bold mb-3 text-center text-[#c14564]">
            {" "}
            {/* Adjusted size/margin */}
            {title}
          </h3>
        )}

        {/* Main Text */}
        <p className="text-sm text-center text-[#4b2e19] mb-6 whitespace-pre-wrap">
          {" "}
          {/* Allow line breaks */}
          {text}
        </p>

        {/* Action Buttons Container */}
        <div
          className={`flex ${
            isAlertMode ? "justify-center" : "justify-between"
          } gap-3`}
        >
          {" "}
          {/* Center button in alert mode */}
          {/* Cancel Button (conditionally rendered) */}
          {!isAlertMode && (
            <button
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-semibold bg-gray-100 hover:bg-gray-200 transition active:scale-[0.98]" // Simple gray button
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}
          {/* Confirm/OK Button - Primary color */}
          <button
            className={`px-4 py-2.5 rounded-lg bg-[#c14564] text-white font-semibold shadow-md hover:bg-[#a63b55] transition active:scale-[0.98] ${
              isAlertMode ? "w-1/2" : "flex-1"
            }`} // Adjust width in alert mode
            onClick={onConfirm}
          >
            {finalConfirmText}
          </button>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
                @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
            `}</style>
    </div>
  );
}
