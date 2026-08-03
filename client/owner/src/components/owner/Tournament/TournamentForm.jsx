import { useState } from "react";

const TournamentForm = ({ formData, setFormData }) => {
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "banner") {
      const file = files[0];

      setFormData((prev) => ({
        ...prev,
        banner: file,
      }));

      if (file) {
        setPreview(URL.createObjectURL(file));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-8">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Tournament Name */}
        <div>
          <label className="block font-medium mb-2">
            Tournament Name
          </label>

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            placeholder="Tournament Name"
          />
        </div>

        {/* Sport */}
        <div>
          <label className="block font-medium mb-2">
            Sport
          </label>

          <select
            name="sport"
            value={formData.sport}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option value="">Select</option>
            <option>Football</option>
            <option>Cricket</option>
            <option>Badminton</option>
            <option>Basketball</option>
            <option>Volleyball</option>
            <option>Kabaddi</option>
          </select>
        </div>

        {/* Type */}

        <div>
          <label className="block font-medium mb-2">
            Tournament Type
          </label>

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option value="">Select</option>
            <option>Knockout</option>
            <option>League</option>
            <option>Round Robin</option>
          </select>
        </div>

        {/* Venue */}

        <div>
          <label className="block font-medium mb-2">
            Venue
          </label>

          <input
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* Address */}

        <div className="md:col-span-2">

          <label className="block font-medium mb-2">
            Address
          </label>

          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

        </div>

        {/* Dates */}

        <div>

          <label className="block font-medium mb-2">
            Start Date
          </label>

          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

        </div>

        <div>

          <label className="block font-medium mb-2">
            End Date
          </label>

          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

        </div>

        <div>

          <label className="block font-medium mb-2">
            Registration Deadline
          </label>

          <input
            type="date"
            name="registrationDeadline"
            value={formData.registrationDeadline}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

        </div>

        {/* Entry Fee */}

        <div>

          <label className="block font-medium mb-2">
            Entry Fee
          </label>

          <input
            type="number"
            name="entryFee"
            value={formData.entryFee}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

        </div>

        {/* Teams */}

        <div>

          <label className="block font-medium mb-2">
            Maximum Teams
          </label>

          <input
            type="number"
            name="maxTeams"
            value={formData.maxTeams}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

        </div>

        {/* Status */}

        <div>

          <label className="block font-medium mb-2">
            Status
          </label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option>Open</option>
            <option>Closed</option>
            <option>Completed</option>
          </select>

        </div>

        {/* Banner */}

        <div className="md:col-span-2">

          <label className="block font-medium mb-2">
            Tournament Banner
          </label>

          <input
            type="file"
            name="banner"
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-48 h-32 object-cover rounded-lg mt-4"
            />
          )}

        </div>

      </div>

      {/* Description */}

      <div className="mt-6">

        <label className="block font-medium mb-2">
          Description
        </label>

        <textarea
          rows={5}
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded-lg p-3"
        />

      </div>

    </div>
  );
};

export default TournamentForm;