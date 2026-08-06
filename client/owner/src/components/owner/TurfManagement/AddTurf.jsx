
import { useState } from "react";
import DatePicker from "react-datepicker";
import {
  GoogleMap,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";
import "react-datepicker/dist/react-datepicker.css";
import { Controller } from "react-hook-form";
import { setHours, setMinutes } from "date-fns";
import { Button, FormField } from "@components/common";
import useAddTurf from "@hooks/owner/useAddTurf";
import { TURF_CATEGORY_OPTIONS } from "@utils/turfCategories";

const AddTurf = () => {
  const { isLoaded } = useJsApiLoader({
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY,
});

const [selectedLocation, setSelectedLocation] = useState({
  lat: 18.5204,
  lng: 73.8567,
});
  const {
    register,
    handleSubmit,
    errors,
    control,
    setValue,
    onSubmit,
    sportTypes,
    newSportType,
    setNewSportType,
    addSportType,
    removeSportType,
    openTime,
    loading,
    primaryCategory,
  } = useAddTurf();

  return (
    <div className="modern-shell">
      <div className="modern-container">
        <div className="modern-hero">
          <h1 className="modern-hero-title">Add New Turf</h1>
          <p className="modern-hero-copy">
            Create a listing with one primary category and the detailed sports it supports.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="modern-panel space-y-4">
            <FormField
              label="Turf Name"
              name="name"
              type="text"
              register={register}
              error={errors.name}
              placeholder="Arena 7"
            />

            <div className="modern-form-field">
              <label className="modern-form-label">Description</label>
              <textarea
                {...register("description")}
                className="modern-textarea h-24 w-full"
                placeholder="Enter turf description"
              />
              {errors.description ? (
                <span className="modern-form-error">{errors.description.message}</span>
              ) : null}
            </div>

            <FormField
              label="Location"
              name="location"
              type="text"
              register={register}
              error={errors.location}
              placeholder="Kakkanad, Kochi"
            />
            {isLoaded && (
  <div className="mt-4">
    <label className="modern-form-label">Select Turf Location</label>

    <GoogleMap
      mapContainerStyle={{
        width: "100%",
        height: "300px",
      }}
      center={selectedLocation}
      zoom={15}
      onClick={(e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        setSelectedLocation({
          lat,
          lng,
        });

        setValue("latitude", lat);
        setValue("longitude", lng);
        console.log("Latitude:", lat);
console.log("Longitude:", lng);
      }}
    >
      <MarkerF position={selectedLocation} />
    </GoogleMap>
    <input
  type="hidden"
  {...register("latitude")}
 />

<input
  type="hidden"
  {...register("longitude")}
/>
  </div>
)}

            <FormField
              label="Price Per Hour"
              name="pricePerHour"
              type="number"
              register={register}
              error={errors.pricePerHour}
              placeholder="1200"
            />
          </div>

          <div className="modern-panel space-y-4">
            <div className="modern-form-field">
              <label className="modern-form-label">Primary Category</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {TURF_CATEGORY_OPTIONS.map((category) => {
                  const Icon = category.icon;
                  return (
                    <label
                      key={category.value}
                      className={`cursor-pointer rounded-[22px] border p-4 transition ${
                        primaryCategory === category.value
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-base-300 bg-base-100 hover:bg-base-200/65"
                      }`}
                    >
                      <input
                        type="radio"
                        value={category.value}
                        className="sr-only"
                        {...register("primaryCategory")}
                      />
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="font-semibold">{category.label}</div>
                          <div className="mt-1 text-sm text-base-content/65">{category.description}</div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.primaryCategory ? (
                <span className="modern-form-error">{errors.primaryCategory.message}</span>
              ) : null}
            </div>

            <div className="modern-form-field">
              <label className="modern-form-label">Image</label>
              <input
                type="file"
                className="file-input file-input-bordered w-full rounded-2xl"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setValue("image", file);
                }}
                {...register("image", { required: true })}
              />
              {errors.image ? <span className="modern-form-error">{errors.image.message}</span> : null}
            </div>

            <div className="modern-form-grid">
              <div className="modern-form-field">
                <label className="modern-form-label">Open Time</label>
                <Controller
                  name="openTime"
                  control={control}
                  rules={{ required: "Open time is required" }}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => {
                        field.onChange(date);
                        setValue("closeTime", null);
                      }}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={60}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      className="modern-input w-full"
                    />
                  )}
                />
                {errors.openTime ? <span className="modern-form-error">{errors.openTime.message}</span> : null}
              </div>

              <div className="modern-form-field">
                <label className="modern-form-label">Close Time</label>
                <Controller
                  name="closeTime"
                  control={control}
                  rules={{ required: "Close time is required" }}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={field.onChange}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={60}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      className="modern-input w-full"
                      disabled={!openTime}
                      minTime={openTime || setHours(setMinutes(new Date(), 0), 0)}
                      maxTime={setHours(setMinutes(new Date(), 30), 23)}
                    />
                  )}
                />
                {errors.closeTime ? <span className="modern-form-error">{errors.closeTime.message}</span> : null}
              </div>
            </div>

            <div className="modern-form-field">
              <label className="modern-form-label">Sport Types</label>
              <div className="md:flex md:space-x-2">
                <input
                  type="text"
                  value={newSportType}
                  onChange={(e) => setNewSportType(e.target.value)}
                  className="modern-input w-full md:flex-grow"
                  placeholder="Add a sport type"
                />
                <button type="button" onClick={addSportType} className="btn btn-outline btn-primary max-sm:mt-2">
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {sportTypes.map((type) => (
                  <span key={type} className="badge badge-lg badge-outline">
                    {type}
                    <button type="button" onClick={() => removeSportType(type)} className="ml-2 text-error">
                      x
                    </button>
                  </span>
                ))}
              </div>
              {errors.sportTypes ? <span className="modern-form-error">{errors.sportTypes.message}</span> : null}
            </div>
          </div>

          <div className="lg:col-span-2">
            <Button type="submit" className="btn-primary w-full" loading={loading}>
              Add Turf
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTurf;
