import ResetPassword from "@/components/ResetPassword";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={"<h1> Loading</h1>"}>
      <ResetPassword />
    </Suspense>
  );
}
