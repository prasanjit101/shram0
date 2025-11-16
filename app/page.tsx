import Image from "next/image";

export default function Home() {
  return (
    <div className="container p-4 grid grid-cols-8 h-screen gap-4 overflow-scroll">
      <div className="col-span-6">
        {/* Show shadcn data table of to-do lists here */}
      </div>
      <div className="col-span-2 border-l flex flex-col items-center">
        {/* Placeholder for microphone icon */}
      </div>
    </div>
  );
}
