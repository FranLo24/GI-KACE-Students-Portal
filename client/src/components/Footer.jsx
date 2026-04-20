export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-white">GI-KACE</p>
          <p className="text-sm">Ghana-India Kofi Annan Centre of Excellence in ICT</p>
        </div>
        <div className="text-sm text-center">
          <p>Email: info@gikace.org | Phone: +233 000 000 000</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} GI-KACE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
