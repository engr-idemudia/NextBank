"use client";

import { Megaphone } from "lucide-react";

export const repoIssueUrl =
  "https://github.com/engr-idemudia/NextBank/issues/new?title=Bug%20Report&body=" +
  encodeURIComponent(
    "## Description\n_A clear description of the bug._\n\n## Steps to Reproduce\n1. \n2. \n3. \n\n## Expected Behaviour\n_What you expected to happen._\n\n## Screenshot\n_Drag and drop a screenshot here._\n\n## Environment\n- Browser: \n- Device: \n",
  );

const ReportBug = () => {
  "https://github.com/engr-idemudia/NextBank/issues/new?title=Bug%20Report&body=" +
    encodeURIComponent(
      "## Description\n_A clear description of the bug._\n\n## Steps to Reproduce\n1. \n2. \n3. \n\n## Expected Behaviour\n_What you expected to happen._\n\n## Screenshot\n_Drag and drop a screenshot here._\n\n## Environment\n- Browser: \n- Device: \n",
    );

  return (
    <a
      href={repoIssueUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 hidden lg:flex items-center gap-2 rounded-full bg-bankGradient px-4 py-2.5 text-14 font-medium text-white shadow-lg transition-transform hover:scale-105"
    >
      <Megaphone size={18} />
      Report a Bug
    </a>
  );
};

export default ReportBug;
