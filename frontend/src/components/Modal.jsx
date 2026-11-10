import React from 'react';
import { X } from 'lucide-react';

// Ventana emergente genérica. Se usa para todos los formularios de crear/editar.
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4 overflow-y-auto" onMouseDown={onClose}>
    <div
      className="bg-white rounded-xl shadow-2xl w-full max-w-xl my-8"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-primary-dark">{title}</h2>
        <button onClick={onClose} aria-label="Cerrar" className="text-gray-400 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// Estilos compartidos por los campos de los formularios (cámbialos aquí y cambian en todos).
export const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-colors';

export const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

// Botones "Cancelar / Guardar" al pie de cada formulario.
export const FormActions = ({ onCancel, saving, error }) => (
  <>
    {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium">{error}</div>}
    <div className="flex justify-end gap-3 pt-2">
      <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">
        Cancelar
      </button>
      <button
        type="submit"
        disabled={saving}
        className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-md transition-colors disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  </>
);

export default Modal;
