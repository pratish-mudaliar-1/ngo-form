import { ScrollyCanvas } from "@/components/ScrollyCanvas";
import { TrustSection } from "@/components/TrustSection";
import { ComplaintForm } from "@/components/ComplaintForm";
import { CommunityReports } from "@/components/CommunityReports";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      <ScrollyCanvas />
      <TrustSection />
      <ComplaintForm />
      <CommunityReports />
      <Footer />
    </main>
  );
}
