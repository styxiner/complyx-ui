import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeAgo', standalone: true, pure: false })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | null): string {
    if (!value) return '—';
    const diff = Date.now() - new Date(value).getTime();
    const s = Math.floor(diff / 1000);
    if (s <  60)  return 'hace un momento';
    if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
    if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
    if (s < 2592000) return `hace ${Math.floor(s / 86400)} días`;
    if (s < 31536000) return `hace ${Math.floor(s / 2592000)} meses`;
    return `hace ${Math.floor(s / 31536000)} años`;
  }
}