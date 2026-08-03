import { Archive, Calendar, Clock, Eye, EyeOff, MapPin, RotateCcw, Star } from "lucide-react";
import { format } from "date-fns";
import { getPrimaryCategoryConfig } from "@utils/turfCategories";

const statusBadgeClass = {
  published: "badge-success",
  unpublished: "badge-warning",
  archived: "badge-neutral",
};

const Turf = ({ turf, onStatusChange }) => {
  const status = turf.status || "published";
  const category = getPrimaryCategoryConfig(turf.primaryCategory, turf.sportTypes);

  return (
    <div className="modern-panel w-full overflow-hidden p-0 transition-shadow duration-300 hover:shadow-xl">
      <figure className="relative h-48 sm:h-56 md:h-64">
        <img src={turf.image} alt={turf.name} className="h-full w-full object-cover" />
        <div className="absolute right-0 top-0 m-2 rounded-full bg-base-100 px-3 py-1 font-semibold text-primary shadow-sm">
          INR {turf.pricePerHour}/hr
        </div>
      </figure>
      <div className="card-body p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="card-title mb-2 text-lg sm:text-xl">{turf.name}</h2>
            {turf.owner?.name ? (
              <p className="text-sm text-base-content/65">Owner: {turf.owner.name}</p>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`badge capitalize ${statusBadgeClass[status] || "badge-ghost"}`}>
              {status}
            </span>
            <span className={`badge ${category.badgeClass}`}>{category.label}</span>
          </div>
        </div>

        <p className="mb-4 text-sm text-base-content/65 sm:text-base">{turf.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <MapPin size={18} className="mr-2 text-primary" />
            <span>{turf.location}</span>
          </div>
          <div className="flex items-center">
            <Clock size={18} className="mr-2 text-primary" />
            <span>
              {turf.openTime} - {turf.closeTime}
            </span>
          </div>
          <div className="flex items-center">
            <Star size={18} className="mr-2 text-primary" />
            <span>{turf.avgRating} ratings</span>
          </div>
          <div className="flex items-center">
            <Calendar size={18} className="mr-2 text-primary" />
            <span>{format(new Date(turf.createdAt), "dd MMM yyyy")}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(turf.sportTypes || []).map((sport) => (
            <span key={sport} className="badge badge-outline badge-accent">
              {sport}
            </span>
          ))}
        </div>

        {onStatusChange ? (
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            {status !== "published" ? (
              <button type="button" className="btn btn-outline btn-success btn-sm" onClick={() => onStatusChange(turf.id, "publish")}>
                <Eye size={14} className="mr-1" /> Publish
              </button>
            ) : (
              <button type="button" className="btn btn-outline btn-warning btn-sm" onClick={() => onStatusChange(turf.id, "unpublish")}>
                <EyeOff size={14} className="mr-1" /> Unpublish
              </button>
            )}
            {status !== "archived" ? (
              <button type="button" className="btn btn-outline btn-error btn-sm" onClick={() => onStatusChange(turf.id, "archive")}>
                <Archive size={14} className="mr-1" /> Archive
              </button>
            ) : (
              <button type="button" className="btn btn-outline btn-info btn-sm" onClick={() => onStatusChange(turf.id, "unarchive")}>
                <RotateCcw size={14} className="mr-1" /> Restore
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Turf;
