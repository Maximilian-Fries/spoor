// Starts the dev server on all interfaces and prints the address for a phone on the same Wi-Fi.
import { networkInterfaces } from "node:os";
import { spawn } from "node:child_process";
import qrcode from "qrcode-terminal";

const port = process.env.PORT || "3000";
const ips = Object.values(networkInterfaces()).flat().filter((i) => i && i.family === "IPv4" && !i.internal).map((i) => i.address);
const lan = ips[0];

console.log(`\n  Local    http://localhost:${port}`);
if (lan) {
  console.log(`  Phone    http://${lan}:${port}   (same Wi-Fi)\n`);
  qrcode.generate(`http://${lan}:${port}`, { small: true });
} else {
  console.log("  No network interface found; phone access needs Wi-Fi.\n");
}

const child = spawn("npx", ["next", "dev", "-H", "0.0.0.0", "-p", port], { stdio: "inherit", shell: process.platform === "win32" });
child.on("exit", (code) => process.exit(code ?? 0));
