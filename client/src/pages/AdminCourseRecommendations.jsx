import CourseLevelPanel from '../components/CourseLevelPanel';

export default function AdminCourseRecommendations() {
  return (
    <div className="space-y-8">
      <div>
        <span className="portal-kicker">Portal operations</span>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">Course Recommendations</h1>
        <p className="mt-2 max-w-2xl text-lg text-slate-600">
          Control which computer literacy level each course is recommended for on the registration form.
        </p>
      </div>

      <CourseLevelPanel />
    </div>
  );
}
