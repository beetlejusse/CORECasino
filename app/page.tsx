import { Navbar } from "@/components/Navbar";
import { ComingSoonSection } from "@/components/landingpage/ComingSoon";
import HeroSection from "@/components/landingpage/HomeScreen";

export default function LandingPage() {
  return (
    <div className=" bg-zinc-950 text-white">
      <Navbar />
      <main>
        <HeroSection />
      </main>
      <footer>
        <ComingSoonSection />
      </footer>
    </div>
  );
}
