import Header from '../components/home/Header'
import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import HowItWorks from '../components/home/HowItWorks'
import DashboardSection from '../components/home/DashboardSection'
import CtaBanner from '../components/home/CtaBanner'
import Footer from '../components/home/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#0B1A35] antialiased">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <DashboardSection />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  )
}
