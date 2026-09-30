import { Employee, CalibrationAlert, ManagerRatingPattern, KPIMetrics, ActivityItem } from '../types';
import { mockEmployees } from '../data/employees';
import { mockCalibrationAlerts, mockManagerPatterns, mockScatterData } from '../data/calibration';
import { mockKPIMetrics, mockOrgPerformanceTrend, mockDepartmentAchievements, mockRecentActivities, CycleTrendData, DepartmentAchievement } from '../data/performance';
import { mockReports, ReportDefinition } from '../data/reports';

// Mutable in-memory store so UI interactions (e.g. updating calibration status or notes) reflect immediately
let alertsStore = [...mockCalibrationAlerts];
let employeesStore = [...mockEmployees];

/**
 * Service Layer - Designed for seamless drop-in replacement with a FastAPI backend
 * All methods return Promises matching future REST endpoints:
 *   - GET /api/employees -> getEmployees()
 *   - GET /api/employees/:id -> getEmployee(id)
 *   - GET /api/performance/:id -> getPerformance(id)
 *   - GET /api/skills/:id -> getSkills(id)
 *   - GET /api/career/:id -> getCareerPath(id)
 *   - GET /api/calibration -> getCalibrationData()
 *   - GET /api/managers/patterns -> getManagerRatingPatterns()
 *   - GET /api/reports -> getReports()
 */

export const api = {
  // Employee Directory
  async getEmployees(params?: {
    search?: string;
    department?: string;
    manager?: string;
    status?: string;
  }): Promise<Employee[]> {
    let result = [...employeesStore];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.manager.toLowerCase().includes(q)
      );
    }
    if (params?.department && params.department !== 'All') {
      result = result.filter(e => e.department === params.department);
    }
    if (params?.manager && params.manager !== 'All') {
      result = result.filter(e => e.manager === params.manager);
    }
    if (params?.status && params.status !== 'All') {
      result = result.filter(e => e.calibrationStatus === params.status);
    }
    return result;
  },

  async getEmployee(id: string): Promise<Employee | undefined> {
    return employeesStore.find(e => e.id === id);
  },

  // Performance Profile
  async getPerformance(id: string) {
    const employee = employeesStore.find(e => e.id === id);
    if (!employee) return null;
    return {
      id: employee.id,
      name: employee.name,
      evidenceScore: employee.evidenceScore,
      summary: employee.summary,
      performanceTrend: employee.performanceTrend,
      goals: employee.goals,
      projects: employee.projects,
      feedback: employee.feedback
    };
  },

  // Skills & Development
  async getSkills(id: string) {
    const employee = employeesStore.find(e => e.id === id);
    if (!employee) return null;
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      skills: employee.skills,
      developmentPlan: employee.developmentPlan
    };
  },

  // Career Path & Promotion Readiness
  async getCareerPath(id: string) {
    const employee = employeesStore.find(e => e.id === id);
    if (!employee) return null;
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      careerProgression: employee.careerProgression
    };
  },

  // Calibration Core Engine
  async getCalibrationData() {
    return {
      alerts: alertsStore,
      scatterData: mockScatterData,
      managerPatterns: mockManagerPatterns
    };
  },

  async getCalibrationAlert(id: string): Promise<CalibrationAlert | undefined> {
    return alertsStore.find(a => a.id === id);
  },

  async updateCalibrationAlert(id: string, updates: Partial<CalibrationAlert>): Promise<CalibrationAlert> {
    const index = alertsStore.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Alert not found');
    alertsStore[index] = {
      ...alertsStore[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return alertsStore[index];
  },

  // Manager Rating Patterns
  async getManagerRatingPatterns(): Promise<ManagerRatingPattern[]> {
    return mockManagerPatterns;
  },

  // Dashboard Aggregates
  async getKPIMetrics(): Promise<KPIMetrics> {
    return mockKPIMetrics;
  },

  async getOrgPerformanceTrend(): Promise<CycleTrendData[]> {
    return mockOrgPerformanceTrend;
  },

  async getDepartmentAchievements(): Promise<DepartmentAchievement[]> {
    return mockDepartmentAchievements;
  },

  async getRecentActivities(): Promise<ActivityItem[]> {
    return mockRecentActivities;
  },

  // Reports Catalog
  async getReports(): Promise<ReportDefinition[]> {
    return mockReports;
  }
};
