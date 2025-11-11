import { useState } from "react";
import Confetti from "../Confetti";
import { Button } from "@/components/ui/button";

export default function ConfettiExample() {
  const [show, setShow] = useState(false);

  return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <Button
        onClick={() => setShow(true)}
        data-testid="button-trigger-confetti"
      >
        Celebrate!
      </Button>
      <Confetti show={show} onComplete={() => setShow(false)} />
    </div>
  );
}
