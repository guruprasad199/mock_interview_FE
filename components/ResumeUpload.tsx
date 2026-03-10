"use client";

import { useState } from "react";

const ResumeUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [skills, setSkills] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);

        const formData = new FormData();
        formData.append("resume", file);

        const res = await fetch("/api/extract-skills", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        try {
            setSkills(JSON.parse(data.skills));
        } catch {
            setSkills([]);
        }

        setLoading(false);
    };

    return (
        <div className="p-6 border rounded-lg max-w-md">
            {/* <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            /> */}

            <input
                type="file"
                accept=".docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <button
                onClick={handleUpload}
                className="mt-4 px-4 py-2 bg-black text-white rounded"
                disabled={loading}
            >
                {loading ? "Extracting..." : "Upload Resume"}
            </button>

            {skills.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-bold">Extracted Skills</h3>
                    <ul className="list-disc ml-5">
                        {skills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ResumeUpload;
