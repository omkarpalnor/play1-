import { User, Mail, Phone, Calendar, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";

const OwnerCard = ({ owner }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center">
          <User className="h-6 w-6 mr-2" />
          <h2 className="card-title">{owner.ownerName}</h2>
        </div>

        <p className="font-semibold">{owner.businessName}</p>

        <div className="flex items-center mt-2">
          <Mail className="h-4 w-4 mr-2 text-base-content/50" />
          <p>{owner.email}</p>
        </div>

        <div className="flex items-center mt-2">
          <Phone className="h-4 w-4 mr-2 text-base-content/50" />
          <p>{owner.phone}</p>
        </div>

        <div className="flex items-center mt-2">
          <Calendar className="h-4 w-4 mr-2 text-base-content/50" />
          <p>
            Created:{" "}
            {owner.createdAt
              ? format(parseISO(owner.createdAt), "PPP")
              : "N/A"}
          </p>
        </div>

        <div className="mt-2">
          <span className="badge badge-primary">{owner.status}</span>
        </div>

        <div className="card-actions justify-end mt-4">
          <Link
            to={`/admin/owners/${owner.id}/turf`}
            className="btn btn-primary"
          >
            <MapPin className="h-4 w-4 mr-2" />
            View Turf
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OwnerCard;