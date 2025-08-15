import { useParams } from "react-router-dom";

export default function VehicleDetails() {
  const { id } = useParams();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-2">Vehicle Details</h1>
      <p className="text-base sm:text-lg">Vehicle ID: {id}</p>
      {/* Show vehicle details here */}
    </div>
  );
}
