import React from "react";

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-lg w-3/4 flex flex-col items-center py-7">
                {children}
                <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Cerrar
                </button>
            </div>
        </div>
    )
}

export default Modal