import { CopyableText } from "@components/ui/copyable-text";
import { DISCORD_INVITE_URL } from "@/constants/links";

const faqData = [
  // GENERAL
  {
    question: "What is a hackathon?",
    answer: (
      <div className="space-y-3 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          A hackathon is a weekend-long event where students come together to
          learn the latest technologies, build innovative projects, and network
          with top companies. ShellHacks is the largest hackathon in Florida,
          bringing thousands of students from around the world together since
          2017!
        </p>
      </div>
    ),
    category: "general",
  },
  {
    question: "How much experience do I need to participate?",
    answer: (
      <div className="space-y-4 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          None! We welcome students from all academic backgrounds and skill
          levels, and provide an inclusive environment for anyone to learn,
          build, and network. Whether you've never coded before or live and
          breathe AI/ML, there's a place for you at ShellHacks! In fact, about
          half of our attendees every year are first-time hackers.
        </p>
        <div className="space-y-2 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
          <p>If you fall in this group, we'll have:</p>
          <ul className="list-disc ml-6 space-y-1 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
            <li>Introductory workshops for you to learn technical skills</li>
            <li>Resources and tools to help you build a project</li>
            <li>Industry mentors to guide you every step of the way</li>
          </ul>
        </div>
        <p>
          No matter where you are on your journey, don't be afraid to take a
          detour and explore the world of tech with us—you won't regret it!
        </p>
      </div>
    ),
    category: "general",
  },
  {
    question: 'Why "ShellHacks"?',
    answer: (
      <div className="space-y-3 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          Well, it started off as a joke about what a turtle-themed hackathon
          would be called. Later on, we actually started thinking about
          organizing a hackathon, but instead of turtles, we decided to focus on
          diversity in Miami. Since the city has an abundance of seashells on
          its beaches, the name stuck! It's also a play on words about computer
          shells, but that's just to draw attention away from all the turtle
          puns.
        </p>
      </div>
    ),
    category: "general",
  },
  {
    question: "How much does it cost?",
    answer: (
      <div className="space-y-3 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          Nothing! That's right, ShellHacks is completely free for all students
          accepted to the event. We provide everything you need to help you
          focus on learning the latest technologies, building innovative
          projects, and networking with top companies—all thanks to the generous
          donations from our sponsors!
        </p>
      </div>
    ),
    category: "general",
  },
  {
    question: "Who can participate?",
    answer: (
      <div className="space-y-2">
        <ul className="list-disc ml-6 space-y-2 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
          <li>
            Students and recent graduates (up to a year) from any college,
            university, or coding bootcamp can participate in ShellHacks.
          </li>
          <li>
            Not a student? You can participate as a volunteer, mentor, or judge
            and join the experience. The application form closed with the event;
            the{" "}
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1D4ED8] hover:text-[#1E3A8A] font-medium underline"
            >
              ShellHacks Discord
            </a>{" "}
            still has the community archive.
          </li>
        </ul>
      </div>
    ),
    category: "general",
  },

  // EVENT DETAILS
  {
    question: "How long is ShellHacks?",
    answer: (
      <div className="space-y-4 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          ShellHacks is a 36-hour hackathon, beginning at 3pm on Friday and
          ending at 5pm on Sunday. Throughout this time, you can expect key
          events such as our opening and closing ceremonies, sponsor fair, and
          judging, as well as a variety of workshops, activities, meals, and
          snacks.
        </p>
        <ul className="list-disc ml-6 space-y-1 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
          <li>
            Hacking (project-building) time begins at 11pm on Friday and ends at
            11am on Sunday.
          </li>
          <li>
            We encourage you to work on a project for as long as you can during
            this time!
          </li>
        </ul>
      </div>
    ),
    category: "event",
  },
  {
    question: "When and where is ShellHacks?",
    answer: (
      <div className="space-y-3 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          ShellHacks takes place from September 25-27 2026 at the Graham Center,
          located at Florida International University's Modesto A. Maidique
          Campus in Miami, Florida.
        </p>
      </div>
    ),
    category: "event",
  },
  {
    question: "Is ShellHacks in-person or virtual?",
    answer: (
      <div className="space-y-3 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          ShellHacks 2026 will be a fully in-person event in alignment with
          MLH's guidelines for this hackathon season. We're excited to welcome
          you on-site for a truly immersive and unforgettable ShellHacks
          experience!
        </p>
      </div>
    ),
    category: "event",
  },
  {
    question: "Do I need a team to work on a project?",
    answer: (
      <div className="space-y-3 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          Not at all! You can choose to work on a solo project, or team up with
          up to three friends (four members total) or fellow students at the
          event. If you're looking for a team, we'll have a team-building
          activity as soon as hacking begins Friday evening to connect you with
          other solo hackers!
        </p>
      </div>
    ),
    category: "event",
  },

  // LOGISTICS
  {
    question: "I Applied—What's Next?",
    answer: (
      <div className="space-y-4 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>Thank you for applying to ShellHacks! Here's what to expect next:</p>
        <ul className="list-disc ml-6 space-y-2 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
          <li>
            <strong>Acceptance Waves:</strong> If you're accepted, you'll
            receive an email from us asking to confirm your acceptance. Be sure
            to check your spam folder just in case!
          </li>
          <li>
            <strong>Confirm Your Attendance:</strong> Once accepted, head to
            your hacker dashboard to confirm your attendance. This step is
            required to secure your spot.
          </li>
          <li>
            <strong>Waitlist Status:</strong> If you're waitlisted, it may be
            because we've reached capacity. Don't worry—spots may open up as
            others withdraw, so keep an eye on your inbox!
          </li>
        </ul>
      </div>
    ),
    category: "logistics",
  },
  {
    question: "Will transportation be provided?",
    answer: (
      <div className="space-y-3 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          Unfortunately, we are not providing buses this year due to budget
          constraints. We appreciate your understanding and still hope to see
          you there!
        </p>
      </div>
    ),
    category: "logistics",
  },
  {
    question: "Will there be a place to sleep?",
    answer: (
      <div className="space-y-4 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          The Graham Center will remain open for the entire duration of the
          event, classrooms included, so you can sleep over and never miss a
          moment of the action!
        </p>
        <p>
          We encourage you to stay as long as possible to make the most of your
          time: work on your project, attend workshops, enjoy meals and
          activities, and fully experience everything ShellHacks has to offer.
        </p>
        <div className="space-y-2 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
          <p>To stay comfortable, we recommend bringing:</p>
          <ul className="list-disc ml-6 space-y-1 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
            <li>
              Something to sleep on (e.g. sleeping bag, twin-sized air mattress,
              or even an inflatable pool floatie—yes, really!)
            </li>
            <li className="space-y-1">
              <span>Essentials such as:</span>
              <ul className="list-disc ml-6 mt-1 space-y-1 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
                <li>Laptop and charger</li>
                <li>Headphones</li>
                <li>Blanket</li>
                <li>Toiletries</li>
              </ul>
            </li>
          </ul>
        </div>
        <p>Be prepared to hack, learn, and have fun all weekend long!</p>
      </div>
    ),
    category: "logistics",
  },
  {
    question: "Will there be travel reimbursement?",
    answer: (
      <div className="space-y-3 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          Unfortunately due to budget constraints, we are not offering travel
          reimbursement at this time. We appreciate how excited you are to come
          to shell this year and hope that you can still make it.
        </p>
      </div>
    ),
    category: "logistics",
  },
  {
    question: "Will food be provided?",
    answer: (
      <div className="space-y-3 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          Yes! Food will be served daily to everyone attending ShellHacks from
          Friday evening to Sunday afternoon. We'll also have coffee, energy
          drinks, tea, and other beverages available to keep you energized!
        </p>
      </div>
    ),
    category: "logistics",
  },
  {
    question: "Do you provide Visas for international students?",
    answer: (
      <div className="space-y-3 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          ShellHacks will not provide visa assistance for hackers, judges,
          volunteers, or mentors. We will never contact you to request personal
          information related to any visa process.
        </p>
        <p>
          If you are approached by anyone claiming to represent ShellHacks and
          asking for such information, please report it immediately.
        </p>
      </div>
    ),
    category: "logistics",
  },

  // SPONSORS/VOLUNTEER
  {
    question: "How can I become a Sponsor?",
    answer: (
      <div className="space-y-3 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          Please reach out to our team at{" "}
          <CopyableText
            value="industry@weareinit.org"
            className="text-[#1D4ED8] hover:text-[#1E3A8A] font-medium underline"
          />{" "}
          and we'll get back to you promptly!
        </p>
      </div>
    ),
    category: "sponsors",
  },
  {
    question: "How can I volunteer?",
    answer: (
      <div className="space-y-3 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          You can{" "}
          <a
            href="https://airtable.com/appgp6itDfgnLCdSt/shrChZunAub4HW9b3"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1D4ED8] hover:text-[#1E3A8A] font-medium underline"
          >
            sign up to be a volunteer
          </a>
          ! We will get back to you as soon as we can with an invite to join a
          call with one of our volunteer leads.
        </p>
      </div>
    ),
    category: "sponsors",
  },
  {
    question: "How can I be a mentor?",
    answer: (
      <div className="space-y-3 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          <a
            href="https://airtable.com/appgp6itDfgnLCdSt/shrChZunAub4HW9b3"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1D4ED8] hover:text-[#1E3A8A] font-medium underline"
          >
            Sign up to be a mentor
          </a>
          ! We welcome all who have prior hackathon experience, industry
          experience, or can assist hackers with basic project needs.
        </p>
      </div>
    ),
    category: "sponsors",
  },
  {
    question: "How can I become a judge?",
    answer: (
      <div className="space-y-3 text-[clamp(0.7rem,0.7vw,0.7vw)] md:text-[clamp(1rem,1vw,1vw)]">
        <p>
          <a
            href="https://airtable.com/appgp6itDfgnLCdSt/shrChZunAub4HW9b3"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1D4ED8] hover:text-[#1E3A8A] font-medium underline"
          >
            Sign up to become a judge
          </a>
          ! We welcome individuals with prior hackathon wins or who are industry
          professionals.
        </p>
      </div>
    ),
    category: "sponsors",
  },
];

export default faqData;
