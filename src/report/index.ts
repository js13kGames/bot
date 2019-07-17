import {
  ReleaseReport,
  generateReleaseReports,
  parseReleaseReports
} from "./releaseReport";

export type Report = {
  releaseReports: ReleaseReport[];
};

const generateHeader = () => `Hello 👋
I am a bot. My job is to review your submission.

`;

export const generateReport = (report: Report) => {
  return generateHeader() + generateReleaseReports(report.releaseReports);
};

export const parseReport = (text: string): Report => ({
  releaseReports: parseReleaseReports(text)
});
