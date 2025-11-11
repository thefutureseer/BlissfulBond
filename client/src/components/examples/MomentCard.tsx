import MomentCard from "../MomentCard";

export default function MomentCardExample() {
  const sampleMoment = {
    id: "1",
    user: "daniel" as const,
    content: "The way you smiled at me this morning made my heart skip a beat. Can't wait for our dinner date tonight!",
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="p-8 max-w-md">
      <MomentCard moment={sampleMoment} />
    </div>
  );
}
