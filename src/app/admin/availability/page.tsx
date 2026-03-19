import { AvailabilityManager } from "@/components/admin/availability/AvailabilityManager";

export const metadata = {
  title: "Availability Manager - Admin | Foodieez Junction",
};

export default function AvailabilityPage() {
  return (
    <div className="pt-2">
      <AvailabilityManager />
    </div>
  );
}
