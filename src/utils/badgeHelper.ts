import { ActivityLog, BadgeCount } from '../types';

export function calculateBadges(logs: ActivityLog[]): BadgeCount[] {
  const matches = logs.filter((log) => log.tipo === 'Partido');

  const counts: Record<string, { count: number; desc: string }> = {
    'Hat-trick': { count: 0, desc: '3 goles en un solo partido' },
    'Póker': { count: 0, desc: '4 o 5 goles en un solo partido' },
    'Doble Hat-trick': { count: 0, desc: '6 o 7 goles en un solo partido' },
    'Doble Póker': { count: 0, desc: '8, 10 u 11 goles en un solo partido' },
    'Triple Hat-trick': { count: 0, desc: '9 goles en un solo partido' },
    '4 Hat-tricks': { count: 0, desc: '12 o más goles en un solo partido' },
    'Asistidor Estrella': { count: 0, desc: '3 o más asistencias en un solo partido' },
    'Socio Ideal': { count: 0, desc: 'Al menos 1 gol y 1 asistencia en el mismo partido' },
  };

  matches.forEach((m) => {
    const g = m.goles;
    const a = m.asistencias;

    // Goles thresholds
    if (g === 3) {
      counts['Hat-trick'].count += 1;
    } else if (g === 4 || g === 5) {
      counts['Póker'].count += 1;
    } else if (g === 6 || g === 7) {
      counts['Doble Hat-trick'].count += 1;
    } else if (g === 8) {
      counts['Doble Póker'].count += 1;
    } else if (g === 9) {
      counts['Triple Hat-trick'].count += 1;
    } else if (g === 10 || g === 11) {
      counts['Doble Póker'].count += 1;
    } else if (g >= 12) {
      counts['4 Hat-tricks'].count += 1;
    }

    // Assists achievement
    if (a >= 3) {
      counts['Asistidor Estrella'].count += 1;
    }

    // Both goal and assist in same game
    if (g >= 1 && a >= 1) {
      counts['Socio Ideal'].count += 1;
    }
  });

  // Keep only unlocked badges (count > 0)
  return Object.entries(counts)
    .filter(([_, data]) => data.count > 0)
    .map(([name, data]) => ({
      name,
      count: data.count,
      description: data.desc,
    }));
}
