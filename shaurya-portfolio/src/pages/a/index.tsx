import React from 'react';
import { NavBar, Hero, TechMarquee, CodeActivity, SelectedWorks, Journal, Explorations, GithubProjects, Footer, GlobalStyles } from '../../App';

export default function AppDevPage() {
  return (
    <div className="bg-bg min-h-screen text-text-primary selection:bg-white/20">
      <GlobalStyles />
      <NavBar />
      <Hero subtitle="app architect craft" roleLabels={["App Architect"]} />
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
//  winnn.me/c for cloud architect , /d for data engineer , and /ai for ai fullstack engineer /m for java-microservices engineer and
// /a for application developer , /u for ui - ux engineer , /qa for QA automation enginee