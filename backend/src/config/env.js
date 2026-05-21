import "dotenv/config";

const REQUIRED_VARS = ["MONGO_URI", "JWT_SECRET", "CORS_ORIGIN", "PORT"];

// Validate required env vars at startup
const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    `[Env] Missing required environment variables: ${missing.join(", ")}`,
  );
  process.exit(1);
}

// Warn if using the default insecure JWT secret
if (process.env.JWT_SECRET === "rphms_super_secret_key_change_in_production") {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[Env] FATAL: Default JWT_SECRET detected in production. Set a secure secret.",
    );
    process.exit(1);
  } else {
    console.warn(
      "[Env] WARNING: Using default JWT_SECRET. Change this before deploying.",
    );
  }
}

export const JWT_SECRET = process.env.JWT_SECRET;
export const MONGO_URI = process.env.MONGO_URI;
export const CORS_ORIGIN = process.env.CORS_ORIGIN;
export const PORT = process.env.PORT || 3001;
export const NODE_ENV = process.env.NODE_ENV || "development";

export default { JWT_SECRET, MONGO_URI, CORS_ORIGIN, PORT, NODE_ENV };
