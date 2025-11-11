import MomentCard from "../MomentCard";

export default function MomentCardExample() {
  const sampleMoment = {
    id: "1",
    userId: "user1",
    content: "The way you smiled at me this morning made my heart skip a beat. Can't wait for our dinner date tonight!",
    sentiment: {
      score: 0.9,
      label: "very positive",
      emotions: ["joy", "love", "excitement"],
    },
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="p-8 max-w-md">
      <MomentCard moment={sampleMoment} />
    </div>
  );
}
