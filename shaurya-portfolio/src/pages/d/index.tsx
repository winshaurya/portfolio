import React from 'react';
import { NavBar, Hero, TechMarquee, CodeActivity, SelectedWorks, Journal, Explorations, GithubProjects, Footer, GlobalStyles } from '../../App';

export default function DataEngPage() {
  return (
    <div className="bg-bg min-h-screen text-text-primary selection:bg-white/20">
      <GlobalStyles />
      <NavBar />
      <Hero subtitle="design think craft" roleLabels={["Data Engineer"]} />
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
