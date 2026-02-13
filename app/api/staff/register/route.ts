import { connectDB } from "@/lib/db";
import Staff from "@/models/Staff";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  await connectDB();

  const { fullName, email, password, role } = await req.json();

  const existing = await Staff.findOne({ email });
  if (existing) return new Response("Staff already exists", { status: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);

  const staff = await Staff.create({
    fullName,
    email,
    password: hashedPassword,
    role,
  });

  return new Response(JSON.stringify({ message: "Staff created", staff }), { status: 201 });
}
