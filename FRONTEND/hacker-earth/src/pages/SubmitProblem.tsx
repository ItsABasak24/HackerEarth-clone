import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AxiosError } from "axios";

/* ================= TYPES ================= */

interface Testcase {
  input: string;
  expected_output: string;
  is_sample: boolean;
}

interface Boilerplate {
  language: string;
  code: string;
}

interface AddProblemForm {
  problem_id: string;
  title: string;
  description: string;
  difficulty: string;
  input_format: string;
  output_format: string;
  constraints: string;
  testcases: Testcase[];
  boilerplates: Boilerplate[];
}

/* ================= COMPONENT ================= */

const SubmitProblem = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<AddProblemForm>({
    problem_id: "",
    title: "",
    description: "",
    difficulty: "",
    input_format: "",
    output_format: "",
    constraints: "",
    testcases: [],
    boilerplates: [],
  });

  /* ================= ADD TESTCASE ================= */

  const addTestcase = () => {
    setFormData((prev) => ({
      ...prev,
      testcases: [
        ...prev.testcases,
        { input: "", expected_output: "", is_sample: false },
      ],
    }));
  };

  /* ================= ADD BOILERPLATE ================= */

  const addBoilerplate = () => {
    setFormData((prev) => ({
      ...prev,
      boilerplates: [
        ...prev.boilerplates,
        { language: "", code: "" },
      ],
    }));
  };

  /* ================= HANDLE SUBMIT ================= */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!formData.problem_id.trim()) {
      alert("Problem ID is required");
      return;
    }

    const allowedLanguages = [
      "c",
      "cpp",
      "java",
      "python",
      "javascript",
      "go",
      "rust",
    ];

    /* ---------- Normalize languages ---------- */

    const cleanedBoilerplates = formData.boilerplates.map((bp) => ({
      ...bp,
      language: bp.language.trim().toLowerCase(),
    }));

    /* ---------- Validate boilerplates ---------- */

    for (let bp of cleanedBoilerplates) {
      if (!allowedLanguages.includes(bp.language)) {
        alert(
          "Language must be one of: c, cpp, java, python, javascript, go, rust"
        );
        return;
      }

      if (!bp.code.trim()) {
        alert("Boilerplate code cannot be empty");
        return;
      }
    }

    /* ---------- Validate testcases ---------- */

    for (let tc of formData.testcases) {
      if (!tc.input.trim() || !tc.expected_output.trim()) {
        alert("Testcase input and output cannot be empty");
        return;
      }
    }

    /* 🔥 IMPORTANT FIX: Inject problem_id into nested arrays */

    const formattedData = {
      ...formData,
      testcases: formData.testcases.map((tc) => ({
        ...tc,
        problem_id: formData.problem_id,
      })),
      boilerplates: cleanedBoilerplates.map((bp) => ({
        ...bp,
        problem_id: formData.problem_id,
      })),
    };

    try {
      const res = await api.post(
        "/api/v1/auth/submit-problem",
        formattedData
      );

      alert(res.data.msg || "Problem submitted successfully");

      navigate("/problems");

    } catch (err) {
      if (err instanceof AxiosError) {
        const details = err.response?.data?.detail;

        if (Array.isArray(details)) {
          const messages = details
            .map((d: any) => d.msg)
            .join("\n");

          alert(messages);
        } else {
          alert(details || "Submission failed");
        }
      } else {
        alert("Submission failed");
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Submit New Problem
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ================= PROBLEM DETAILS ================= */}

        <div className="bg-gray-900 p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">
            Problem Details
          </h2>

          <input
            className="w-full p-2 bg-gray-800 border rounded"
            placeholder="Problem ID"
            value={formData.problem_id}
            onChange={(e) =>
              setFormData({ ...formData, problem_id: e.target.value })
            }
          />

          <input
            className="w-full p-2 bg-gray-800 border rounded"
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <textarea
            className="w-full p-2 bg-gray-800 border rounded"
            placeholder="Description"
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <input
            className="w-full p-2 bg-gray-800 border rounded"
            placeholder="Difficulty (easy / medium / hard)"
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
          />

          <textarea
            className="w-full p-2 bg-gray-800 border rounded"
            placeholder="Input Format"
            value={formData.input_format}
            onChange={(e) =>
              setFormData({ ...formData, input_format: e.target.value })
            }
          />

          <textarea
            className="w-full p-2 bg-gray-800 border rounded"
            placeholder="Output Format"
            value={formData.output_format}
            onChange={(e) =>
              setFormData({ ...formData, output_format: e.target.value })
            }
          />

          <textarea
            className="w-full p-2 bg-gray-800 border rounded"
            placeholder="Constraints"
            value={formData.constraints}
            onChange={(e) =>
              setFormData({ ...formData, constraints: e.target.value })
            }
          />
        </div>

        {/* ================= TESTCASES ================= */}

        <div className="bg-gray-900 p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Testcases
            </h2>
            <button
              type="button"
              onClick={addTestcase}
              className="bg-blue-600 px-3 py-1 rounded"
            >
              Add Testcase
            </button>
          </div>

          {formData.testcases.map((tc, index) => (
            <div
              key={index}
              className="space-y-2 border p-3 rounded bg-gray-800"
            >
              <textarea
                placeholder="Input"
                className="w-full p-2 bg-gray-700 rounded"
                value={tc.input}
                onChange={(e) => {
                  const updated = [...formData.testcases];
                  updated[index].input = e.target.value;
                  setFormData({ ...formData, testcases: updated });
                }}
              />

              <textarea
                placeholder="Expected Output"
                className="w-full p-2 bg-gray-700 rounded"
                value={tc.expected_output}
                onChange={(e) => {
                  const updated = [...formData.testcases];
                  updated[index].expected_output = e.target.value;
                  setFormData({ ...formData, testcases: updated });
                }}
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={tc.is_sample}
                  onChange={(e) => {
                    const updated = [...formData.testcases];
                    updated[index].is_sample = e.target.checked;
                    setFormData({ ...formData, testcases: updated });
                  }}
                />
                Sample Testcase
              </label>
            </div>
          ))}
        </div>

        {/* ================= BOILERPLATES ================= */}

        <div className="bg-gray-900 p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Boilerplate Code
            </h2>
            <button
              type="button"
              onClick={addBoilerplate}
              className="bg-green-600 px-3 py-1 rounded"
            >
              Add Boilerplate
            </button>
          </div>

          {formData.boilerplates.map((bp, index) => (
            <div
              key={index}
              className="space-y-2 border p-3 rounded bg-gray-800"
            >
              <input
                placeholder="Language (c, cpp, java, python, javascript, go, rust)"
                className="w-full p-2 bg-gray-700 rounded"
                value={bp.language}
                onChange={(e) => {
                  const updated = [...formData.boilerplates];
                  updated[index].language = e.target.value;
                  setFormData({ ...formData, boilerplates: updated });
                }}
              />

              <textarea
                placeholder="Boilerplate Code"
                rows={4}
                className="w-full p-2 bg-gray-700 rounded"
                value={bp.code}
                onChange={(e) => {
                  const updated = [...formData.boilerplates];
                  updated[index].code = e.target.value;
                  setFormData({ ...formData, boilerplates: updated });
                }}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="bg-purple-600 px-6 py-3 rounded font-semibold"
        >
          Submit Problem
        </button>

      </form>
    </div>
  );
};

export default SubmitProblem;