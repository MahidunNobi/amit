"use client";
import { useState } from "react";
import { Button, Modal } from "flowbite-react";
import { signOut } from "next-auth/react";

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      setOpen(false);
      await signOut({ callbackUrl: "/login" });
    } catch (err: unknown) {
      setError((err as Error).message || "Error deleting account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button color="alternative" onClick={() => setOpen(true)} className="bg-red-600! hover:bg-red-700! text-white! font-semibold px-4 py-2 rounded shadow focus:outline-none focus:ring-2 focus:ring-red-400! focus:ring-opacity-50 cursor-pointer">
        Delete Account
      </Button>
      <Modal show={open} onClose={() => setOpen(false)} size="md" popup>
        <div className="text-center p-6">
          <h3 className="mb-5 text-lg font-normal text-gray-700 dark:text-gray-200">
            Are you sure to delete the account?
          </h3>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <div className="flex justify-center gap-4 mt-4">
            <Button color="failure" onClick={handleDelete} disabled={loading} className="bg-red-600! hover:bg-red-700! text-white! font-semibold px-4 py-2 rounded shadow focus:outline-none focus:ring-2 focus:ring-red-400! focus:ring-opacity-50 cursor-pointer">
              {loading ? "Deleting..." : "Yes, delete"}
            </Button>
            <Button color="gray" onClick={() => setOpen(false)} disabled={loading} className="cursor-pointer">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
} 