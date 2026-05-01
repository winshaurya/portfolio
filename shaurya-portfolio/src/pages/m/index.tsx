import React from 'react';
import { NavBar, Hero, TechMarquee, CodeActivity, SelectedWorks, Journal, Explorations, GithubProjects, Footer } from '../../App';

export default function JavaMicroservicesPage() {
  return (
    <div className="bg-bg min-h-screen text-text-primary selection:bg-white/20">
      <NavBar />
      <Hero />
      <TechMarquee />
      <CodeActivity />
      <Journal />
      <SelectedWorks />
      <Explorations />
      <GithubProjects />
      <Footer />
    </div>
  );
}
