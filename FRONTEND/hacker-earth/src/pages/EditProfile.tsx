import { useEffect, useState } from "react";
import api from "../services/api";

interface FormDataType {
  gender: string;
  location: string;
  birthday: string;
  bio: string;
  socials: {
    website: string;
    github: string;
    linkedin: string;
    twitter: string;
  };
  education: {
    institution: string;
    degree: string;
    start_date: string;
    end_date: string;
  };
  work: {
    company: string;
    role: string;
    start_date: string;
    end_date: string;
  };
  skills: string[];
}

const EditProfile = () => {
  const [formData, setFormData] = useState<FormDataType>({
    gender: "",
    location: "",
    birthday: "",
    bio: "",
    socials: {
      website: "",
      github: "",
      linkedin: "",
      twitter: "",
    },
    education: {
      institution: "",
      degree: "",
      start_date: "",
      end_date: "",
    },
    work: {
      company: "",
      role: "",
      start_date: "",
      end_date: "",
    },
    skills: [],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/v1/auth/profile");

      setFormData({
        gender: res.data.gender || "",
        location: res.data.location || "",
        birthday: res.data.birthday || "",
        bio: res.data.bio || "",
        socials: res.data.socials || {
          website: "",
          github: "",
          linkedin: "",
          twitter: "",
        },
        education: res.data.education || {
          institution: "",
          degree: "",
          start_date: "",
          end_date: "",
        },
        work: res.data.work || {
          company: "",
          role: "",
          start_date: "",
          end_date: "",
        },
        skills: res.data.skills || [],
      });
    } catch (err) {
      console.error("PROFILE FETCH ERROR:", err);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name.startsWith("socials.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socials: { ...prev.socials, [key]: value },
      }));
    } else if (name.startsWith("education.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        education: { ...prev.education, [key]: value },
      }));
    } else if (name.startsWith("work.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        work: { ...prev.work, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanedData: any = {};

      if (formData.gender) cleanedData.gender = formData.gender;
      if (formData.location) cleanedData.location = formData.location;
      if (formData.birthday) cleanedData.birthday = formData.birthday;
      if (formData.bio) cleanedData.bio = formData.bio;

      if (Object.values(formData.socials).some(v => v))
        cleanedData.socials = formData.socials;

      if (Object.values(formData.education).some(v => v))
        cleanedData.education = formData.education;

      if (Object.values(formData.work).some(v => v))
        cleanedData.work = formData.work;

      if (formData.skills.length > 0)
        cleanedData.skills = formData.skills;

      await api.put("/api/v1/auth/update-basic-details", cleanedData);

      alert("Profile updated successfully");
    } catch (err: any) {
      console.log("UPDATE ERROR:", err.response?.data);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Basic Info</h2>

          <input
            type="text"
            name="gender"
            placeholder="Gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded mb-3"
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded mb-3"
          />

          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded mb-3"
          />

          <textarea
            name="bio"
            placeholder="Bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded"
          />
        </div>

        {/* Social Links */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Social Links</h2>

          <input
            type="text"
            name="socials.website"
            placeholder="Website"
            value={formData.socials.website}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded mb-3"
          />

          <input
            type="text"
            name="socials.github"
            placeholder="GitHub"
            value={formData.socials.github}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded mb-3"
          />

          <input
            type="text"
            name="socials.linkedin"
            placeholder="LinkedIn"
            value={formData.socials.linkedin}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded mb-3"
          />

          <input
            type="text"
            name="socials.twitter"
            placeholder="Twitter"
            value={formData.socials.twitter}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded"
          />
        </div>

        {/* Education */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Education</h2>

          <input
            type="text"
            name="education.institution"
            placeholder="Institution"
            value={formData.education.institution}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded mb-3"
          />

          <input
            type="text"
            name="education.degree"
            placeholder="Degree"
            value={formData.education.degree}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded mb-3"
          />

          <input
            type="text"
            name="education.start_date"
            placeholder="Start Date"
            value={formData.education.start_date}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded mb-3"
          />

          <input
            type="text"
            name="education.end_date"
            placeholder="End Date"
            value={formData.education.end_date}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded"
          />
        </div>

        {/* Work */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Work</h2>

          <input
            type="text"
            name="work.company"
            placeholder="Company"
            value={formData.work.company}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded mb-3"
          />

          <input
            type="text"
            name="work.role"
            placeholder="Role"
            value={formData.work.role}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded mb-3"
          />

          <input
            type="text"
            name="work.start_date"
            placeholder="Start Date"
            value={formData.work.start_date}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded mb-3"
          />

          <input
            type="text"
            name="work.end_date"
            placeholder="End Date"
            value={formData.work.end_date}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded"
          />
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Skills (comma separated)</h2>

          <input
            type="text"
            placeholder="Java, React, MongoDB"
            value={formData.skills.join(", ")}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                skills: e.target.value.split(",").map((s) => s.trim()),
              }))
            }
            className="w-full p-2 bg-gray-800 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-cyan-500 px-6 py-2 rounded hover:bg-cyan-600"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>

      </form>
    </div>
  );
};

export default EditProfile;
