import FormField from "../../components/common/FormField";
import Button from "../../components/common/Button";
import useBecomeOwner from "../../hooks/useBecomeOwner";

const BecomeOwner = () => {
  const { register, handleSubmit, errors, onSubmit, loading } =
    useBecomeOwner();

  return (
    <div className="container mx-auto mt-20 p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Become a Turf Owner
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Form */}
        <div className="card bg-base-100 shadow-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)}>

            <h2 className="text-xl font-semibold mb-4">
              Business Information
            </h2>

            <FormField
              label="Business Name"
              name="businessName"
              type="text"
              register={register}
              error={errors.businessName}
            />

            <FormField
              label="Owner Name"
              name="ownerName"
              type="text"
              register={register}
              error={errors.ownerName}
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              register={register}
              error={errors.email}
            />

            <FormField
              label="Phone"
              name="phone"
              type="text"
              register={register}
              error={errors.phone}
            />

            <FormField
              label="Address"
              name="address"
              type="text"
              register={register}
              error={errors.address}
            />

            <div className="grid grid-cols-2 gap-4">

              <FormField
                label="City"
                name="city"
                type="text"
                register={register}
                error={errors.city}
              />

              <FormField
                label="State"
                name="state"
                type="text"
                register={register}
                error={errors.state}
              />

            </div>

            <FormField
              label="Pincode"
              name="pincode"
              type="text"
              register={register}
              error={errors.pincode}
            />

            <hr className="my-6" />

            <h2 className="text-xl font-semibold mb-4">
              Verification Details
            </h2>

            <FormField
              label="Aadhaar Number"
              name="aadhaarNumber"
              type="text"
              register={register}
              error={errors.aadhaarNumber}
            />

            <FormField
              label="PAN Number"
              name="panNumber"
              type="text"
              register={register}
              error={errors.panNumber}
            />

            <FormField
              label="GST Number (Optional)"
              name="gstNumber"
              type="text"
              register={register}
              error={errors.gstNumber}
            />

            <Button
              className="btn btn-primary w-full mt-6"
              loading={loading}
            >
              Submit Application
            </Button>

          </form>
        </div>

        {/* Info */}
        <div className="card bg-base-100 shadow-lg p-6">

          <h2 className="text-2xl font-bold mb-4">
            Why Become a Turf Owner?
          </h2>

          <ul className="list-disc pl-5 space-y-3">
            <li>Manage multiple turfs from one dashboard.</li>
            <li>Accept or reject bookings instantly.</li>
            <li>Track earnings and revenue reports.</li>
            <li>Create tournaments and manage registrations.</li>
            <li>Send offers and coupons to customers.</li>
            <li>View customer reviews and ratings.</li>
            <li>Receive booking notifications in real time.</li>
            <li>Grow your sports business with PlayRizon.</li>
          </ul>

          <div className="divider"></div>

          <p className="text-sm opacity-70">
            Your application will be reviewed by the PlayRizon Admin.
            Once approved, your account will automatically receive
            Owner access.
          </p>

        </div>

      </div>
    </div>
  );
};

export default BecomeOwner;