import AvatarCard from "@/components/research/AvatarCard";

export default function AvatarsReport({ record }) {
  const subAvatars = record.sub_avatars || [];

  return (
    <div className="space-y-5">
      <AvatarCard label="Core avatar" avatar={record.core_avatar} highlighted />

      {subAvatars.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {subAvatars.map((avatar, index) => (
            <AvatarCard
              key={`${avatar?.name}-${index}`}
              label={`Sub avatar ${index + 1}`}
              avatar={avatar}
            />
          ))}
        </div>
      )}
    </div>
  );
}