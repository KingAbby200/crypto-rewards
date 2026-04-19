import { Link } from "wouter";

export default function Success() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold mb-6">Thank You!</h1>
        <p className="text-xl text-gray-400 mb-10">
          Your form has successfully been submitted.<br />
          The SFC team will get back to you shortly via email with your personalized user URL.
        </p>
        <Link href="/">
          <button className="px-8 py-4 bg-white text-black rounded-2xl font-medium">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
