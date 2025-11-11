import HeartProgress from "../HeartProgress";

export default function HeartProgressExample() {
  return (
    <div className="p-8 max-w-md space-y-4">
      <HeartProgress value={7} max={10} label="Moments Together" />
      <HeartProgress value={15} max={20} label="Tasks Completed" />
    </div>
  );
}
