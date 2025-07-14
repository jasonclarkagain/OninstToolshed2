import { TriangleAlert } from "lucide-react";

export default function DisclaimerBanner() {
  return (
    <div className="bg-[hsl(38,92%,50%)] bg-opacity-10 border border-[hsl(38,92%,50%)] border-opacity-30 rounded-lg p-4 mb-8">
      <div className="flex items-start">
        <TriangleAlert className="text-[hsl(38,92%,50%)] h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-[hsl(38,92%,50%)] font-medium mb-1">Legal Notice</h3>
          <p className="text-gray-300 text-sm">
            This tool is intended for legal and ethical OSINT practices only. Users are responsible for compliance with applicable laws and regulations. Unauthorized access to systems or data is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
