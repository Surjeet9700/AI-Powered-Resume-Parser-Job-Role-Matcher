const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4 text-center">
        <p>© {new Date().getFullYear()} AI-Powered Resume Parser & Job Matcher</p>
        <p className="text-gray-400 text-sm mt-1">
          Powered by React, TypeScript, and Tailwind CSS
        </p>
      </div>
    </footer>
  );
};

export default Footer;
