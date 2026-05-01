import React from 'react';
import { NavBar, Hero, TechMarquee, CodeActivity, SelectedWorks, Journal, Explorations, GithubProjects, Footer, GlobalStyles } from '../../App';

export default function QADevPage() {
  return (
    <div className="bg-bg min-h-screen text-text-primary selection:bg-white/20">
      <GlobalStyles />
      <NavBar />
      <Hero subtitle="testing till death" roleLabels={["QA Engineer"]} />
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
