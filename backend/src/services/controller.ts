import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Ensure proper cleanup on app shutdown
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Create a new event
export async function createEvent(data: any) {
  try {
    return await prisma.event.create({ data });
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

// Get all approved events
export async function getApprovedEvents() {
  try {
    return await prisma.event.findMany({
      where: { status: "approved" },
    });
  } catch (error) {
    console.error("Error fetching approved events:", error);
    throw error;
  }
}

// Get all pending events
export async function getPendingEvents() {
  try {
    return await prisma.event.findMany({
      where: { status: "pending" },
    });
  } catch (error) {
    console.error("Error fetching pending events:", error);
    throw error;
  }
}

// Update event status (approve/cancel)
export async function updateEventStatus(
  id: string,
  status: string,
  reviewNote?: string,
) {
  try {
    return await prisma.event.update({
      where: { id },
      data: { status, reviewNote, reviewedAt: new Date() },
    });
  } catch (error) {
    console.error("Error updating event status:", error);
    throw error;
  }
}
