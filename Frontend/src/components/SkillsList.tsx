interface SkillsListProps {
  skills: string[];
}

const SkillsList = ({ skills }: SkillsListProps) => {
  if (skills.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-yellow-700">No skills were extracted from your resume.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span
          key={index}
          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
        >
          {skill}
        </span>
      ))}
    </div>
  );
};

export default SkillsList;
