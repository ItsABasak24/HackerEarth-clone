import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Profile {
  _id: string;
  email: string;
  name: string;
  avatar?: string | null;
  gender?: string | null;
  location?: string | null;
  birthday?: string | null;
  bio?: string | null;
  socials?: {
    website?: string | null;
    github?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
  };
  education?: {
    institution?: string | null;
    degree?: string | null;
    start_date?: string | null;
    end_date?: string | null;
  };
  work?: {
    company?: string | null;
    role?: string | null;
    start_date?: string | null;
    end_date?: string | null;
  };
  skills?: string[];
}
const handleAvatarChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("avatar", file);   // MUST be "avatar"

  try {
    await api.put(
      "/api/v1/auth/update-avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert("Avatar updated successfully");
    window.location.reload(); // simplest way
  } catch (err) {
    console.error(err);
    alert("Failed to update avatar");
  }
};


const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/v1/auth/profile")
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-10 text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="p-10">No profile data found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">

      {/* ===== Header Section ===== */}
      <div className="relative w-32 h-32 mx-auto">
  <img
    src={profile?.avatar || "/default-avatar.png"}
    alt="avatar"
    className="w-32 h-32 rounded-full object-cover border"
  />

  <input
    type="file"
    accept="image/*"
    onChange={handleAvatarChange}
    className="absolute inset-0 opacity-0 cursor-pointer"
  />

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-gray-500">{profile.email}</p>

          <button
            onClick={() => navigate("/profile/edit")}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* ===== Basic Info ===== */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Basic Info</h2>
        <div className="space-y-2 text-gray-700">
          <p><strong>Gender:</strong> {profile.gender || "Not specified"}</p>
          <p><strong>Location:</strong> {profile.location || "Not specified"}</p>
          <p><strong>Birthday:</strong> {profile.birthday || "Not specified"}</p>
          <p><strong>Bio:</strong> {profile.bio || "No bio added yet"}</p>
        </div>
      </div>

      {/* ===== Skills ===== */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Skills</h2>

        {profile.skills && profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p>No skills added</p>
        )}
      </div>

      {/* ===== Social Links ===== */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Social Links</h2>

        <div className="space-y-2 text-gray-700">
          <p><strong>Website:</strong> {profile.socials?.website || "Not added"}</p>
          <p><strong>GitHub:</strong> {profile.socials?.github || "Not added"}</p>
          <p><strong>LinkedIn:</strong> {profile.socials?.linkedin || "Not added"}</p>
          <p><strong>Twitter:</strong> {profile.socials?.twitter || "Not added"}</p>
        </div>
      </div>

      {/* ===== Education ===== */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Education</h2>

        {profile.education?.institution ? (
          <div className="text-gray-700">
            <p><strong>Institution:</strong> {profile.education.institution}</p>
            <p><strong>Degree:</strong> {profile.education.degree}</p>
            <p>
              <strong>Duration:</strong>{" "}
              {profile.education.start_date} - {profile.education.end_date}
            </p>
          </div>
        ) : (
          <p>No education details added</p>
        )}
      </div>

      {/* ===== Work ===== */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Work Experience</h2>

        {profile.work?.company ? (
          <div className="text-gray-700">
            <p><strong>Company:</strong> {profile.work.company}</p>
            <p><strong>Role:</strong> {profile.work.role}</p>
            <p>
              <strong>Duration:</strong>{" "}
              {profile.work.start_date} - {profile.work.end_date}
            </p>
          </div>
        ) : (
          <p>No work experience added</p>
        )}
      </div>

    </div>
  );
};

export default Profile;
