import type { SiteConfig } from '@dsc-isc/shared';
import { prisma } from '../lib/prisma.js';

function toDto(row: { key: string; value: string; updatedAt: Date }): SiteConfig {
  return { key: row.key, value: JSON.parse(row.value) as unknown, updatedAt: row.updatedAt.toISOString() };
}

export async function listSiteConfig(): Promise<SiteConfig[]> {
  const rows = await prisma.siteConfig.findMany({ orderBy: { key: 'asc' } });
  return rows.map(toDto);
}

export async function upsertSiteConfig(key: string, value: unknown, updatedBy: string): Promise<SiteConfig> {
  const row = await prisma.siteConfig.upsert({
    where: { key },
    create: { key, value: JSON.stringify(value), updatedBy },
    update: { value: JSON.stringify(value), updatedBy },
  });
  return toDto(row);
}
