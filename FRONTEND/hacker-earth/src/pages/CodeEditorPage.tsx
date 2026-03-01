import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Editor from "@monaco-editor/react";

const monacoLanguageMap: Record<string, string> = {
  python: "python",
  java: "java",
  cpp: "cpp",
  c: "c",
  rust: "rust",
  go: "go",
};

const CodeEditorPage = () => {
  const { id } = useParams();

  const [problem, setProblem] = useState<any>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [language, setLanguage] = useState<string>("");
  const [code, setCode] = useState<string>("");

  const [runResult, setRunResult] = useState<any>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runPassed, setRunPassed] = useState(false);

  /* ---------------- Fetch Problem ---------------- */
  useEffect(() => {
    if (!id) return;
    fetchProblem();
    fetchLanguages();
  }, [id]);

  const fetchProblem = async () => {
    const res = await api.get(`/api/v1/problems/${id}`);
    setProblem(res.data);
  };

  /* ---------------- Fetch Available Languages ---------------- */
  const fetchLanguages = async () => {
    const res = await api.get(
      `/api/v1/problems/${id}/languages`
    );

    const fetchedLanguages = res.data.languages || [];

    setLanguages(fetchedLanguages);

    if (fetchedLanguages.length > 0) {
      setLanguage(fetchedLanguages[0]);
    }
  };

  /* ---------------- Fetch Boilerplate ---------------- */
  useEffect(() => {
    if (!language) return;
    fetchTemplate(language);
  }, [language]);

  const fetchTemplate = async (lang: string) => {
    const res = await api.get(
      `/template?problem_id=${id}&language=${lang}`
    );
    setCode(res.data.code);
  };

  /* ---------------- Run Code ---------------- */
  const handleRun = async () => {
    try {
      setIsRunning(true);
      setRunResult(null);
      setSubmitResult(null);
      setRunPassed(false);

      const res = await api.post("/api/v1/execute/run", {
        problem_id: id,
        language,
        code,
      });

      setRunResult(res.data);

      if (res.data.status === "Passed") {
        setRunPassed(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  /* ---------------- Submit Code ---------------- */
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitResult(null);

      const res = await api.post("/api/v1/execute/submit", {
        problem_id: id,
        language,
        code,
      });

      setSubmitResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!problem) return <div>Loading...</div>;

  return (
    <div className="flex h-screen">

      {/* LEFT SIDE */}
      <div className="w-1/2 p-6 overflow-y-scroll border-r">
        <h1 className="text-2xl font-bold">{problem.title}</h1>

        <p className="mt-4">{problem.description}</p>

        <h3 className="mt-6 font-semibold">Input Format</h3>
        <p>{problem.input_format}</p>

        <h3 className="mt-6 font-semibold">Output Format</h3>
        <p>{problem.output_format}</p>

        <h3 className="mt-6 font-semibold">Constraints</h3>
        <p>{problem.constraints}</p>

        <h3 className="mt-6 font-semibold">Sample Testcases</h3>
        {problem.sample_testcases?.map((tc: any, index: number) => (
          <div key={index} className="mt-4 p-3 bg-gray-100">
            <p><strong>Input:</strong></p>
            <pre>{tc.input}</pre>
            <p><strong>Output:</strong></p>
            <pre>{tc.expected_output}</pre>
          </div>
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div className="w-1/2 p-4 flex flex-col">

        {/* Dynamic Language Dropdown */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mb-3 border p-2"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </select>

        <Editor
          height="60%"
          language={monacoLanguageMap[language] || "plaintext"}
          value={code}
          onChange={(value) => setCode(value || "")}
        />

        <div className="flex gap-4 mt-3">
          <button
            onClick={handleRun}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Run
          </button>

          <button
            onClick={handleSubmit}
            disabled={!runPassed}
            className="bg-green-500 text-white px-4 py-2 disabled:opacity-50"
          >
            Submit
          </button>
        </div>

        {/* OUTPUT SECTION */}
        <div className="mt-4 bg-gray-900 text-white rounded p-4 h-60 overflow-y-auto">

          {isRunning && (
            <p className="text-yellow-400 font-semibold">
              Verifying Sample Testcases...
            </p>
          )}

          {isSubmitting && (
            <p className="text-blue-400 font-semibold">
              Verifying Hidden Testcases...
            </p>
          )}

          {/* RUN RESULT */}
          {runResult && runResult.results?.length > 0 && (
            <>
              <h3
                className={`text-lg font-bold mb-2 ${
                  runResult.status === "Passed"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {runResult.status}
              </h3>

              {runResult.results.map((tc: any, index: number) => (
                <div
                  key={index}
                  className={`mt-3 p-3 rounded border ${
                    tc.passed
                      ? "border-green-500 bg-green-900/20"
                      : "border-red-500 bg-red-900/20"
                  }`}
                >
                  <div className="flex justify-between">
                    <span>Sample Testcase {index + 1}</span>
                    <span
                      className={`font-bold ${
                        tc.passed ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {tc.passed ? "Passed" : "Failed"}
                    </span>
                  </div>

                  {!tc.passed && (
                    <div className="mt-2 text-sm">
                      <div>Expected: {tc.expected}</div>
                      <div>Your Output: {tc.actual}</div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* SUBMIT RESULT */}
          {submitResult && submitResult.results && (
            <>
              <h3 className="text-lg font-bold mb-2">
                Hidden Testcase Results
              </h3>

              {submitResult.results.map((tc: any, index: number) => (
                <div
                  key={index}
                  className={`mt-2 p-3 rounded border ${
                    tc.passed
                      ? "border-green-500 bg-green-900/20"
                      : "border-red-500 bg-red-900/20"
                  }`}
                >
                  <div className="flex justify-between">
                    <span>Hidden Testcase {tc.testcase_number}</span>
                    <span
                      className={`font-bold ${
                        tc.passed ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {tc.passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                </div>
              ))}

              <div className="mt-4">
                <h2
                  className={`text-xl font-bold ${
                    submitResult.verdict === "Accepted"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {submitResult.verdict}
                </h2>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage;