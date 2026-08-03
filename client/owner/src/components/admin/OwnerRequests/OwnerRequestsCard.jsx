import {
  User,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

const OwnerRequestCard = ({
  request,
  onAccept,
  onReject,
  onReconsider,
  isProcessing,
  isRejected,
}) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title flex items-center">
          <User size={20} className="mr-2" />
          {request.ownerName}
        </h2>

        <p className="flex items-center text-sm text-base-content/70">
          <Mail size={16} className="mr-2" />
          {request.email}
        </p>

        <p className="flex items-center text-sm text-base-content/70">
          <MapPin size={16} className="mr-2" />
          {request.city}
        </p>

        <p className="text-sm mt-2">
          <strong>Business:</strong> {request.businessName}
        </p>

        <p className="text-sm">
          <strong>Phone:</strong> {request.phone}
        </p>

        <p className="text-sm">
          <strong>Status:</strong> {request.status}
        </p>

        <div className="card-actions justify-end mt-4">
          {isRejected ? (
            <button
              onClick={() => onReconsider(request.id)}
              className="btn btn-primary btn-sm"
              disabled={isProcessing}
            >
              <RefreshCw size={16} className="mr-1" />
              {isProcessing ? "Loading..." : "Reconsider"}
            </button>
          ) : (
            <>
              <button
                onClick={() => onAccept(request.id)}
                className="btn btn-success btn-sm text-white"
                disabled={isProcessing}
              >
                <CheckCircle size={16} className="mr-1" />
                {isProcessing ? "Loading..." : "Approve"}
              </button>

              <button
                onClick={() => onReject(request.id)}
                className="btn btn-error btn-sm text-white"
                disabled={isProcessing}
              >
                <XCircle size={16} className="mr-1" />
                {isProcessing ? "Loading..." : "Reject"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerRequestCard;