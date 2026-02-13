import { connectDB } from "@/lib/db";
import Staff from "@/models/Staff";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
  await connectDB();

  const { email, password } = await req.json();
  const staff = await Staff.findOne({ email });

  if (!staff) return new Response("Invalid credentials", { status: 401 });

  const isMatch = await bcrypt.compare(password, staff.password);
  if (!isMatch) return new Response("Invalid credentials", { status: 401 });

  const token = jwt.sign(
    { id: staff._id, email: staff.email, role: staff.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return new Response(JSON.stringify({ token, role: staff.role, fullName: staff.fullName }), { status: 200 });
}
