
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { randomBytes } from "node:crypto";

const rl = readline.createInterface({
  input: stdin,
  output: stdout
});

const password = await rl.question(
  "Enter your NEW staff password: "
);

if (password.length < 12) {
  console.log("Use a password with at least 12 characters.");
  rl.close();
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const secret = randomBytes(48).toString("hex");

console.log("\nYour generated credentials:");
console.log("STAFF_PASSWORD_HASH=" + hash);
console.log("JWT_SECRET=" + secret);

rl.close();
