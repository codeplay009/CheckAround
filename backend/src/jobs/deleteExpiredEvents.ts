import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function deleteExpiredEvents() {
  try {
    const today = new Date();

    // set to today's midnight
    today.setHours(0, 0, 0, 0);

    const events = await prisma.event.findMany();

    for (const event of events) {
      if (!event.startDate) continue;

      const eventDate = new Date(event.startDate);

      // delete if event date already passed
      if (eventDate < today) {
        await prisma.event.delete({
          where: {
            id: event.id,
          },
        });

        console.log(`Deleted expired event: ${event.title}`);
      }
    }
  } catch (error) {
    console.error("Auto delete failed:", error);
  }
}
