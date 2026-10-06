const tabData = [
  {
    label: "SHELLHACKS",
    image: `/landing/people.webp`,
    imageAlt: "ShellHacks participants",
    content: (
      <>
        <p className="text-white text-shadow-lg text-[clamp(0.75rem,1.5vw,2vw)] mb-4 md:mb-6">
          Ready to immerse yourself in the ultimate tech experience? Join us for
          ShellHacks, Florida's Largest Hackathon! Over 1,400 students from
          across the state and around the world will come together to:
        </p>
        <ul className="text-white text-shadow-lg text-[clamp(0.75rem,1.5vw,2vw)] mb-0 list-disc list-inside space-y-1">
          <li>
            <b>Build:</b> Develop innovative projects
          </li>
          <li>
            <b>Network:</b> Network with top companies, and more!
          </li>
          <li>
            <b>Learn:</b> Learn the latest technologies
          </li>
        </ul>
      </>
    ),
  },
  {
    label: "SPONSOR FAIR",
    image: `/landing/about_sponsor_fair.webp`,
    imageAlt: "Students networking at sponsor fair",
    content: (
      <>
        <p className="text-white text-shadow-lg text-[clamp(0.75rem,1.5vw,2vw)] mb-4 md:mb-6">
          Ready to launch your tech career? Connect with professionals from top
          companies, discover open roles, and get the inside scoop on company
          culture and interviews. Bring your resume, curiosity, and energy—this
          is your chance to make connections and score your next big
          opportunity!
        </p>
        <ul className="text-white text-shadow-lg text-[clamp(0.75rem,1.5vw,2vw)] mb-0 list-disc list-inside space-y-1">
          <li>
            <b>Meet:</b> Professionals from leading tech companies
          </li>
          <li>
            <b>Discover:</b> Internships and job opportunities
          </li>
          <li>
            <b>Connect:</b> Get noticed early in the recruiting season
          </li>
        </ul>
      </>
    ),
  },
  {
    label: "WORKSHOPS",
    image: `/landing/about_workshops.webp`,
    imageAlt: "Students attending tech workshops",
    content: (
      <>
        <p className="text-white text-shadow-lg text-[clamp(0.75rem,1.5vw,2vw)] mb-4 md:mb-6">
          Dive into beginner-friendly workshops designed to spark your curiosity
          and grow your skills! Explore the latest in tech and discover new
          career paths with hands-on sessions led by industry pros.
        </p>
        <ul className="text-white text-shadow-lg text-[clamp(0.75rem,1.5vw,2vw)] mb-0 list-disc md:columns-2 list-inside space-y-1">
          <li>Mobile Development</li>
          <li>Career Development</li>
          <li>AI & Machine Learning</li>
          <li>Game Development</li>
          <li>IT & Cybersecurity</li>
          <li>Web Development</li>
          <li>Design & Product</li>
        </ul>
      </>
    ),
  },
  {
    label: "PROJECTS",
    image: `/landing/about_projects.webp`,
    imageAlt: "Students working on hackathon projects",
    content: (
      <>
        <p className="text-white text-shadow-lg text-[clamp(0.75rem,1.5vw,2vw)] mb-4 md:mb-6">
          Unleash your creativity and build something amazing! Collaborate with
          fellow students, access awesome tools and mentors, and bring your
          ideas to life— no matter your tech stack or experience level.
        </p>
        <ul className="text-white text-shadow-lg text-[clamp(0.75rem,1.5vw,2vw)] mb-0 list-disc list-inside space-y-1">
          <li>
            <b>Create:</b> Any project, any technology
          </li>
          <li>
            <b>Collaborate:</b> Work with peers and mentors
          </li>
          <li>
            <b>Showcase:</b> Your skills to top companies
          </li>
        </ul>
      </>
    ),
  },
];

export default tabData;
