export function entryToRow(entry, userId) {
  return {
    id: entry.id,
    user_id: userId,
    text: entry.text,
    date_key: entry.dateKey,
    growth: Number(entry.growth ?? entry.xp ?? 0),
    categories: entry.categories ?? [],
    entry_data: entry,
    created_at: entry.createdAt,
  };
}

export function rowToEntry(row) {
  return {
    ...row.entry_data,
    id: row.id,
    text: row.text,
    dateKey: row.date_key,
    growth: Number(row.growth),
    xp: Number(row.growth),
    categories: row.categories ?? row.entry_data?.categories ?? [],
    createdAt: row.created_at,
  };
}

export function activitiesToRows(entry, userId) {
  return (entry.activities ?? []).map((activity) => ({
    user_id: userId,
    entry_id: entry.id,
    activity_type: activity.type ?? "activity",
    category: activity.category ?? "Discipline",
    duration_minutes: Number(activity.minutes ?? activity.duration ?? 30),
    growth: Number(activity.growth ?? activity.xp ?? 0),
    activity_data: activity,
  }));
}
