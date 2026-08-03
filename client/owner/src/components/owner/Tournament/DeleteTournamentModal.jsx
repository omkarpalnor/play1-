import { AlertTriangle } from "lucide-react";

const DeleteTournamentModal = ({
  isOpen,
  onClose,
  onDelete,
  tournamentName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center gap-3 border-b p-6">

          <div className="rounded-full bg-red-100 p-3">

            <AlertTriangle
              size={24}
              className="text-red-600"
            />

          </div>

          <div>

            <h2 className="text-xl font-bold">
              Delete Tournament
            </h2>

            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>

          </div>

        </div>

        {/* Body */}

        <div className="p-6">

          <p className="text-gray-700">
            Are you sure you want to delete
          </p>

          <p className="mt-2 rounded-lg bg-gray-100 p-3 font-semibold">
            {tournamentName}
          </p>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t p-6">

          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
};

export default DeleteTournamentModal;