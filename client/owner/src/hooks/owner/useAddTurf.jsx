import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { format } from "date-fns";
import toast from "react-hot-toast";
import axiosInstance from "../useAxiosInstance";
import { useNavigate } from "react-router-dom";
import { inferPrimaryCategory } from "@utils/turfCategories";

const addTurfSchema = yup.object().shape({
  name: yup
    .string()
    .required("Enter the name of the turf")
    .min(3, "Name must be at least 3 characters long"),
  description: yup
    .string()
    .required("Enter the description of the turf")
    .min(3, "Description must be at least 3 characters long"),
  location: yup
    .string()
    .required("Enter the location of the turf")
    .min(3, "Location must be at least 3 characters long"),
  pricePerHour: yup
    .number()
    .required("Enter the price per hour of the turf")
    .min(500, "Price per hour must be at least 500 rupees")
    .max(3000, "Price per hour must be at most 3000 rupees"),
  image: yup
    .mixed()
    .test(
      "image",
      "Please upload a valid image (PNG, JPEG, or WebP)",
      function (value) {
        if (!value || !value[0]) return false;
        const file = value[0];
        const acceptedFormats = ["image/png", "image/jpeg", "image/webp"];
        return acceptedFormats.includes(file.type);
      }
    ),
  openTime: yup.date().required("Open time is required"),
  closeTime: yup
    .date()
    .required("Close time is required")
    .min(yup.ref("openTime"), "Close time must be after open time"),
  primaryCategory: yup.string().required("Choose a primary category"),
  sportTypes: yup
    .array()
    .of(yup.string())
    .min(1, "At least one sport type is required"),
});

export default function useAddTurf() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(addTurfSchema),
    defaultValues: {
      sportTypes: [],
      primaryCategory: "",
      openTime: null,
      closeTime: null,
    },
  });

  const [sportTypes, setSportTypes] = useState([]);
  const [newSportType, setNewSportType] = useState("");
  const openTime = watch("openTime");
  const primaryCategory = watch("primaryCategory");

  useEffect(() => {
    setValue("sportTypes", sportTypes);
    if (!primaryCategory) {
      setValue("primaryCategory", inferPrimaryCategory(sportTypes));
    }
  }, [primaryCategory, setValue, sportTypes]);

  const addSportType = () => {
    const normalizedSportType = String(newSportType || "").trim();
    if (normalizedSportType && !sportTypes.includes(normalizedSportType)) {
      setSportTypes([...sportTypes, normalizedSportType]);
      setNewSportType("");
    }
  };

  const removeSportType = (type) => {
    setSportTypes(sportTypes.filter((sport) => sport !== type));
  };

  const onSubmit = async (data) => {
  setLoading(true);

  const payload = {
    name: data.name,
    sport: data.primaryCategory,
    address: data.location,
    pricePerHour: Number(data.pricePerHour),
    imageUrl: "",
    latitude: 18.5204,
longitude: 73.8567,
  };

  console.log("Payload:", payload);

  try {
    const response = await axiosInstance.post("/api/Turf", payload);

    const result = response.data;

    toast.success(result.message || "Turf added successfully");

    navigate("/owner/turfs");
  } catch (error) {
    console.error(error);

    if (error.response) {
      toast.error(error.response.data?.message || "Failed to add turf");
    } else if (error.request) {
      toast.error("No response from server.");
    } else {
      toast.error(error.message);
    }
  } finally {
    setLoading(false);
  }
};

   

  return {
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
    primaryCategory,
    loading,
  };
}
