import { CheckCircle, XCircle, Phone } from "lucide-react";

const RegistrationCard = ({
  registration,
  onApprove,
  onReject,
}) => {
  return (
    <div className="bg-white rounded-xl border shadow p-5">

      <div className="flex justify-between items-start">

        <div>
          <h2 className="text-xl font-bold">
            {registration.teamName}
          </h2>

          <p className="text-gray-500">
            Captain : {registration.captainName}
          </p>

          <p className="flex items-center gap-2 mt-2">
            <Phone size={16} />
            {registration.contactNumber}
          </p>
        </div>

        <span
          className={`badge
            ${
              registration.status === "Approved"
                ? "badge-success"
                : registration.status === "Rejected"
                ? "badge-error"
                : "badge-warning"
            }`}
        >
          {registration.status}
        </span>

      </div>

      <div className="mt-5">

        <h3 className="font-semibold mb-2">
          Players
        </h3>

        <ul className="list-disc ml-5">
  {(registration.players || []).map((player, index) => (
    <li key={index}>{player.name}</li>
  ))}
</ul>

      </div>

      {registration.status === "Pending" && (
        <div className="flex gap-3 mt-6">

          <button
            onClick={() => onApprove(registration.id)}
            className="btn btn-success flex-1"
          >
            <CheckCircle size={18} />
            Approve
          </button>

          <button
            onClick={() => onReject(registration.id)}
            className="btn btn-error flex-1"
          >
            <XCircle size={18} />
            Reject
          </button>

        </div>
      )}

    </div>
  );
};

export default RegistrationCard;