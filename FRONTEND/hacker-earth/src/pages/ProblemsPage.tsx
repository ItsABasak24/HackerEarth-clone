// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../services/api";

// const ProblemsPage = () => {
//   const [problems, setProblems] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchProblems();
//   }, []);

//   const fetchProblems = async () => {
//   try {
//     const res = await api.get("/api/v1/problems");
//     console.log("API RESPONSE:", res.data);
//     setProblems(res.data);
//   } catch (err) {
//     console.error(err);
//   }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Problems</h1>

//       {problems.map((problem: any) => (
//         <div
//           key={problem.problem_id}
//           onClick={() => navigate(`/problems/${problem.problem_id}`)}
//           className="flex justify-between p-4 border cursor-pointer hover:bg-gray-100"
//         >
//           <div>
//             <h2 className="font-semibold">{problem.title}</h2>
//             <span className="text-sm text-gray-500">
//               {problem.difficulty}
//             </span>
//           </div>

//           {problem.isSolved && (
//             <span className="text-green-600 font-bold">✔</span>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ProblemsPage;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ProblemsPage = () => {
  const [problems, setProblems] = useState<any[]>([]);
  const [canAdd, setCanAdd] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems();
    checkEligibility();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await api.get("/api/v1/problems");
      setProblems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const checkEligibility = async () => {
    try {
      const res = await api.get("/api/v1/auth/can-add-problem");
      setCanAdd(res.data.allowed);
    } catch (err) {
      console.error("Eligibility error", err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Problems</h1>

        {canAdd && (
          <button
            onClick={() => navigate("/submit-problem")}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Request New Problem
          </button>
        )}
      </div>

      {problems.map((problem: any) => (
        <div
          key={problem.problem_id}
          onClick={() => navigate(`/problems/${problem.problem_id}`)}
          className="flex justify-between p-4 border cursor-pointer hover:bg-gray-800"
        >
          <div>
            <h2 className="font-semibold">{problem.title}</h2>
            <span className="text-sm text-gray-400">
              {problem.difficulty}
            </span>
          </div>

          {problem.isSolved && (
            <span className="text-green-400 font-bold">✔</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProblemsPage;