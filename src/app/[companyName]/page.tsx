import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import { redirect } from "next/navigation";

export default async function CompanyPage({ params }: { params: { companyName: string } }) {
    const { companyName } = await params;
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect(`/${companyName}/login`);
  }
  const company = await Company.findOne({ companyName:  { $regex: new RegExp(`^${companyName}$`, "i") } });
  if (!company) {
    return <div className="text-center mt-20 text-2xl font-bold text-red-600">Company not found</div>;
  }
  if (company.email !== session.user.email) {
    redirect(`/${companyName}/login`);
  }
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">{company.companyName}</h1>
    </div>
  );
} 