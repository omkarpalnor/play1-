import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";
import { TURF_CATEGORY_OPTIONS, inferPrimaryCategory } from "@utils/turfCategories";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  pricePerHour: Yup.number()
    .required("Price per hour is required")
    .positive("Price per hour must be a positive number")
    .min(500, "Price per hour must be greater than 500")
    .max(10000, "Price per hour must be less than 10000"),
  location: Yup.string().required("Location is required"),
  openTime: Yup.date().required("Open time is required"),
  closeTime: Yup.date()
    .required("Close time is required")
    .min(Yup.ref("openTime"), "Close time must be after open time"),
  primaryCategory: Yup.string().required("Primary category is required"),
  sportTypes: Yup.array().of(Yup.string()).min(1, "At least one sport type is required"),
});

const EditTurfForm = ({ turf, onSave, onCancel, turfId }) => {
  const initialSportTypes = Array.isArray(turf.sportTypes) ? turf.sportTypes : [];
  const [sportTypes, setSportTypes] = useState(initialSportTypes);
  const [newSportType, setNewSportType] = useState("");

  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ...turf,
      primaryCategory: inferPrimaryCategory(initialSportTypes, turf.primaryCategory),
      sportTypes: initialSportTypes,
      openTime: turf.openTime ? parse(turf.openTime, "hh:mm a", new Date()) : null,
      closeTime: turf.closeTime ? parse(turf.closeTime, "hh:mm a", new Date()) : null,
    },
  });

  const watchedCategory = watch("primaryCategory");

  useEffect(() => {
    setValue("sportTypes", sportTypes);
    if (!watchedCategory) {
      setValue("primaryCategory", inferPrimaryCategory(sportTypes));
    }
  }, [setValue, sportTypes, watchedCategory]);

  const addSportType = () => {
    const normalizedValue = String(newSportType || "").trim();
    if (normalizedValue && !sportTypes.includes(normalizedValue)) {
      setSportTypes((prev) => [...prev, normalizedValue]);
      setNewSportType("");
    }
  };

  const removeSportType = (sportType) => {
    setSportTypes((prev) => prev.filter((item) => item !== sportType));
  };

  const onSubmit = (data) => {
    onSave(
      {
        ...data,
        sportTypes,
        openTime: data.openTime ? format(data.openTime, "hh:mm aa") : null,
        closeTime: data.closeTime ? format(data.closeTime, "hh:mm aa") : null,
      },
      turfId
    );
  };

  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    const isTurfExisting = !!turf.id;

    return currentDate.getTime() < selectedDate.getTime() || isTurfExisting;
  };

  const filterCloseTime = (time) => {
    const openTime = getValues("openTime");
    return openTime?.getTime() < time.getTime();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="modern-panel h-full">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Edit Turf</h2>

        <div className="modern-form-field">
          <label className="modern-form-label">Primary Category</label>
          <div className="grid gap-3 sm:grid-cols-2">
            {TURF_CATEGORY_OPTIONS.map((category) => {
              const Icon = category.icon;
              return (
                <label
                  key={category.value}
                  className={`cursor-pointer rounded-[20px] border p-3 transition ${
                    watchedCategory === category.value
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
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{category.label}</div>
                      <div className="mt-1 text-xs text-base-content/65">{category.description}</div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          {errors.primaryCategory ? <p className="modern-form-error">{errors.primaryCategory.message}</p> : null}
        </div>

        <input
          type="text"
          {...register("name")}
          placeholder="Turf Name"
          className={`modern-input w-full text-sm ${errors.name ? "input-error" : ""}`}
        />
        {errors.name ? <p className="text-error text-sm">{errors.name.message}</p> : null}

        <textarea
          {...register("description")}
          placeholder="Description"
          className={`modern-textarea w-full text-sm ${errors.description ? "textarea-error" : ""}`}
        />
        {errors.description ? <p className="text-error text-sm">{errors.description.message}</p> : null}

        <input
          type="number"
          {...register("pricePerHour", { valueAsNumber: true })}
          placeholder="Price per Hour"
          className={`modern-input w-full text-sm ${errors.pricePerHour ? "input-error" : ""}`}
        />
        {errors.pricePerHour ? <p className="text-error text-sm">{errors.pricePerHour.message}</p> : null}

        <input
          type="text"
          {...register("location")}
          placeholder="Location"
          className={`modern-input w-full text-sm ${errors.location ? "input-error" : ""}`}
        />
        {errors.location ? <p className="text-error text-sm">{errors.location.message}</p> : null}

        <div className="modern-form-field">
          <label className="modern-form-label">Sport Types</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={newSportType}
              onChange={(event) => setNewSportType(event.target.value)}
              className="modern-input w-full text-sm"
              placeholder="Add a sport type"
            />
            <button type="button" className="btn btn-outline btn-primary" onClick={addSportType}>
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sportTypes.map((sportType) => (
              <span key={sportType} className="badge badge-outline badge-lg">
                {sportType}
                <button type="button" onClick={() => removeSportType(sportType)} className="ml-2 text-error">
                  x
                </button>
              </span>
            ))}
          </div>
          {errors.sportTypes ? <p className="modern-form-error">{errors.sportTypes.message}</p> : null}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="label">
              <span className="label-text">Open Time</span>
            </label>
            <Controller
              control={control}
              name="openTime"
              render={({ field }) => (
                <DatePicker
                  {...field}
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={60}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className={`modern-input w-full text-sm ${errors.openTime ? "input-error" : ""}`}
                  filterTime={filterPassedTime}
                />
              )}
            />
            {errors.openTime ? <p className="text-error text-sm">{errors.openTime.message}</p> : null}
          </div>
          <div className="flex-1">
            <label className="label">
              <span className="label-text">Close Time</span>
            </label>
            <Controller
              control={control}
              name="closeTime"
              render={({ field }) => (
                <DatePicker
                  {...field}
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={60}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className={`modern-input w-full text-sm ${errors.closeTime ? "input-error" : ""}`}
                  filterTime={filterCloseTime}
                  disabled={!getValues("openTime")}
                />
              )}
            />
            {errors.closeTime ? <p className="text-error text-sm">{errors.closeTime.message}</p> : null}
          </div>
        </div>

        <div className="card-actions justify-end mt-4">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            Save Changes
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditTurfForm;
