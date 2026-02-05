import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { ParkingService } from "../src/services/parkingService.js";

dotenv.config();

// Default to `parking2.json` in project root; allow override via CLI arg
const defaultPath = process.argv[2] || path.join(process.cwd(), "parking2.json");
const filePath = path.resolve(defaultPath);

(async () => {
  try {
    if (!fs.existsSync(filePath)) {
      console.error("File not found:", filePath);
      process.exit(2);
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const payload = JSON.parse(raw);

    // Accept several possible shapes: an array of slots, { slots: [...] }, or { parkingSlots: [...] }
    let slots = null;
    if (Array.isArray(payload)) {
      slots = payload;
    } else if (Array.isArray(payload.slots)) {
      slots = payload.slots;
    } else if (Array.isArray(payload.boxes)) {
      slots = payload.boxes;
    } else if (Array.isArray(payload.parkingSlots)) {
      slots = payload.parkingSlots;
    } else if (Array.isArray(payload.data)) {
      slots = payload.data;
    }

    if (!slots) {
      console.error("Unable to locate slots array in JSON file. Expected an array or { slots: [...] }.");
      process.exit(3);
    }

    // Normalize slots to required shape: { label, x1, y1, x2, y2 }
    const normalized = slots.map((s) => {
      return {
        label: String(s.label ?? s.spotName ?? s.id ?? s.name),
        x1: Number(s.x1 ?? s.x ?? s.left ?? 0),
        y1: Number(s.y1 ?? s.y ?? s.top ?? 0),
        x2: Number(s.x2 ?? s.right ?? s.width ? (s.x + s.width) : 0),
        y2: Number(s.y2 ?? s.bottom ?? s.height ? (s.y + s.height) : 0),
      };
    });

    const parkingId = 2;
    const svc = new ParkingService();

    const existing = await svc.getParkingSlots(parkingId);
    if (existing && existing.length > 0) {
      console.log(`Slots already exist for parking_lot_id=${parkingId}, skipping insert.`);
      process.exit(0);
    }

    const result = await svc.registerParkingSlots(parkingId, normalized);
    console.log(`Inserted/updated ${result.length} slots for parking_lot_id=${parkingId}`);
    process.exit(0);
  } catch (err) {
    console.error("Failed to import slots:", err.message || err);
    process.exit(1);
  }
})();
