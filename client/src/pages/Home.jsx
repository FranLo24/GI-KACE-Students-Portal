import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const courses = [
  {
    title: 'Cybersecurity',
    icon: '🔒',
    desc: 'Learn to protect systems, networks, and programs from digital attacks.',
  },
  {
    title: 'Data Analytics with Python',
    icon: '🐍',
    desc: 'Harness Python to analyze, visualize, and interpret complex datasets.',
  },
  {
    title: 'Data Analytics with BI',
    icon: '📊',
    desc: 'Use business intelligence tools to drive data-informed decisions.',
  },
  {
    title: 'Certificate in Software Development',
    icon: '💻',
    desc: 'Build real-world applications with modern development practices.',
  },
  {
    title: 'CCNA',
    icon: '🌐',
    desc: 'Master networking fundamentals and earn Cisco certification readiness.',
  },
  {
    title: 'Diploma in Business Computing',
    icon: '🖥️',
    desc: 'Combine business acumen with essential computing skills.',
  },
  {
    title: 'Office Productivity Suite',
    icon: '📝',
    desc: 'Become proficient with modern office productivity and collaboration tools.',
  },
  {
    title: 'Corporate Trainings',
    icon: '🏢',
    desc: 'Tailored ICT training programs designed for corporate teams.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <section className="bg-blue-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            GI-KACE Course Registration
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Advance your ICT skills with world-class training at the Ghana-India Kofi Annan Centre
            of Excellence in ICT. Enrol today and take the next step in your career.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg shadow hover:bg-blue-50 transition"
          >
            Register Now
          </Link>
        </div>
      </section>

      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">About GI-KACE</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            The Ghana-India Kofi Annan Centre of Excellence in ICT (GI-KACE) is a premier
            technology training institution dedicated to bridging the digital skills gap in Ghana
            and across Africa. Established through a partnership between the governments of Ghana
            and India, GI-KACE offers industry-aligned programmes in cybersecurity, data analytics,
            software development, networking, and more — empowering individuals and organisations
            to thrive in the digital economy.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Our Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course.title}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
              >
                <span className="text-4xl mb-3">{course.icon}</span>
                <h3 className="text-base font-semibold text-gray-800 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-500">{course.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex-grow" />
      <Footer />
    </div>
  );
}
