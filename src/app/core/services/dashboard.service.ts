import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Plan, UserBandwidthInfo, MonthUsage } from '../models/api.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPlans(): Observable<Plan[]> {
    console.log('Fetching user plans...');
    return this.http.get<Plan[]>(`${this.API_URL}/api/order/plans`).pipe(
      catchError(error => {
        console.log('Failed to fetch plans:', error);
        return of([]);
      })
    );
  }

  getBandwidthInfo(): Observable<UserBandwidthInfo> {
    console.log('Fetching bandwidth info...');
    return this.http.get<UserBandwidthInfo>(`${this.API_URL}/api/user/bandwidth`).pipe(
      catchError(error => {
        console.log('Failed to fetch bandwidth info:', error);
        return of({
          dailyRecords: {},
          monthlyRecords: {},
          accountInfo: {
            trafficConsumed: 0,
            trafficConsumedString: '0 GB',
            trafficBalance: 0,
            trafficBalanceString: '0 GB'
          }
        });
      })
    );
  }

  getUsageData(monthlyRecords: any): MonthUsage[] {
    return Object.entries(monthlyRecords).map(([key, value]: [string, any]) => {
      const date = new Date(key);
      return {
        month: date.toLocaleString('default', { month: 'long' }),
        usage: value.consumedBandwidth || 0
      };
    });
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 GB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
}
