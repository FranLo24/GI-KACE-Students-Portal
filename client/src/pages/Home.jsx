import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import portalHero from '../assets/portal-hero.png';
import registerHero from '../assets/register-hero.png';
import { featuredCourses, portalStats } from '../data/courseCatalog';

export default function Home() {
  return (
    <div className="portal-shell flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 pb-16 pt-8">
        <section className="portal-container grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="animate-rise-in space-y-6">
            <span className="portal-kicker">Student admissions</span>
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold leading-tight md:text-6xl">
                A <span className="portal-gradient-text">clear digital portal</span> for GI-KACE learners.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600">
                Explore ICT programmes, review key learning areas, and complete your registration through a guided experience built for prospective students.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="portal-button-primary">
                Start Registration
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {portalStats.map((stat) => (
                <div key={stat.label} className="portal-data-card animate-glow-pulse">
                  <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-rise-in relative">
            <div className="glass-panel animate-float-soft overflow-hidden p-3">
              <img
                src={portalHero}
                alt="Students learning in a GI-KACE-style training environment"
                className="h-[420px] w-full rounded-[24px] object-cover"
              />
            </div>
            <div className="portal-data-card absolute -bottom-5 left-6 max-w-xs">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
                Learning pathways
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Explore programs, compare learning paths, and jump straight into registration from one place.
              </p>
            </div>
          </div>
        </section>

        <section className="portal-container mt-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="portal-panel overflow-hidden p-3">
            <img
              src={registerHero}
              alt="Learners collaborating during digital skills training"
              className="h-[360px] w-full rounded-[22px] object-cover"
            />
          </div>

          <div className="space-y-5">
            <span className="portal-kicker">Why students use it</span>
            <h2 className="portal-section-title">A straightforward starting point for every application</h2>
            <p className="text-slate-600">
              The portal makes it simple for applicants to understand available programs and submit accurate registration details without any confusion.
            </p>
            {/* <div className="grid gap-4">
              {portalHighlights.map((item) => (
                <div key={item} className="glass-panel px-5 py-4 text-sm text-slate-600">
                  {item}
                </div>
              ))}
            </div> */}
          </div>
        </section>

        <section className="portal-container mt-16">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="portal-kicker">Course catalogue</span>
              <h2 className="portal-section-title mt-3">Programmes designed for practical ICT learning</h2>
            </div>
            <p className="max-w-2xl text-sm text-slate-500">
              Browse featured training options and choose the course that best matches your goals, interests, and current skill level.
            </p>
          </div>

          <div className="portal-course-grid">
            {featuredCourses.map((course, index) => (
              <article
                key={course.title}
                className="group portal-course-card"
                style={{ animationDelay: index * 90 + 'ms' }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent px-5 pb-4 pt-16">
                    {/* <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
                      {course.spotlight}
                    </p> */}
                  </div>
                </div>
                <div className="portal-course-card-body">
                  <div className="portal-course-card-copy">
                    <h3 className="text-xl font-semibold text-slate-900">{course.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{course.description}</p>
                  </div>
                  {/* <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-700">
                    {course.outcomes}
                  </p> */}
                  <Link to="/register" className="portal-course-card-button">
                    Choose this course
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="portal-container mt-16">
          <div className="glass-panel bg-mesh overflow-hidden px-6 py-8 md:px-10 md:py-10">
            <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <span className="portal-kicker">Ready to enrol?</span>
                <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
                  Start your registration now.
                </h2>
                <p className="mt-3 max-w-2xl text-slate-600">
                  Complete your application, review your details, and submit with confidence.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link to="/register" className="portal-button-primary">
                  Register Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
