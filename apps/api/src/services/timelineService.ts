import type { TimelineEvent, TimelineEventInput } from '@dsc-isc/shared';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';

function toDto(row: {
  id: string;
  year: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
}): TimelineEvent {
  return { ...row };
}

export async function listTimelineEvents(includeInactive: boolean): Promise<TimelineEvent[]> {
  const rows = await prisma.timelineEvent.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: { order: 'asc' },
  });
  return rows.map(toDto);
}

export async function getTimelineEventById(id: string): Promise<TimelineEvent> {
  const row = await prisma.timelineEvent.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, 'Evento no encontrado');
  return toDto(row);
}

export async function createTimelineEvent(input: TimelineEventInput): Promise<TimelineEvent> {
  const row = await prisma.timelineEvent.create({ data: input });
  return toDto(row);
}

export async function updateTimelineEvent(id: string, input: TimelineEventInput): Promise<TimelineEvent> {
  const row = await prisma.timelineEvent.update({ where: { id }, data: input });
  return toDto(row);
}

export async function deleteTimelineEvent(id: string): Promise<void> {
  await prisma.timelineEvent.delete({ where: { id } });
}
