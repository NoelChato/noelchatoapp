export class ReportsQueryDto {
  from?: string;
  to?: string;
  status?: 'all' | 'inside' | 'out';
}
