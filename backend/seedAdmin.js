import mongoose from "mongoose";
import crypto from "crypto";
import "dotenv/config";
import User from "./src/models/User.js";
import url from "url";

function buildNonSrvUri() {
  // If MONGO_URI is already a non-SRV string, return it
  const raw = process.env.MONGO_URI;
  if (raw && !raw.startsWith("mongodb+srv://")) return raw;

  // Allow building from parts: MONGO_HOSTS (comma-separated host:port), MONGO_DB, MONGO_USER, MONGO_PASS, MONGO_OPTIONS
  const hosts = process.env.MONGO_HOSTS; // e.g. host1:27017,host2:27017,host3:27017
  if (!hosts) return null;

  const db = process.env.MONGO_DB || "admin";
  const user = process.env.MONGO_USER || "";
  const pass = process.env.MONGO_PASS || "";
  const opts =
    process.env.MONGO_OPTIONS ||
    "replicaSet=rs0&ssl=true&authSource=admin&retryWrites=true&w=majority";

  const cred = user
    ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`
    : "";
  return `mongodb://${cred}${hosts}/${db}?${opts}`;
}

const email = process.env.ADMIN_EMAIL || "admin@tenayehealth.com";
const full_name = process.env.ADMIN_NAME || "System Admin";
const password =
  process.env.ADMIN_PASSWORD || crypto.randomBytes(8).toString("hex");

async function main() {
  const built = buildNonSrvUri();
  let mongoUri = built || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI is missing and MONGO_HOSTS was not provided to build a non-SRV URI",
    );
  }

  if (mongoUri.startsWith("mongodb+srv://") && !built) {
    console.error(
      "Detected an +srv connection string but no MONGO_HOSTS provided.",
    );
    console.error(
      "Provide a non-SRV URI in MONGO_URI or set MONGO_HOSTS/MONGO_DB/MONGO_USER/MONGO_PASS to build one.",
    );
    process.exit(1);
  }

  console.log(
    "[Seeder] Using Mongo URI:",
    mongoUri.replace(/:[^:@]+@/, ":******@"),
  );
  await mongoose.connect(mongoUri);

  let user = await User.findOne({ email });
  if (user) {
    user.full_name = full_name;
    user.role = "admin";
    user.password = password;
    await user.save();
    console.log("Admin updated");
  } else {
    user = await User.create({
      full_name,
      email,
      password,
      role: "admin",
    });
    console.log("Admin created");
  }

  console.log(
    JSON.stringify(
      {
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        password,
      },
      null,
      2,
    ),
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
