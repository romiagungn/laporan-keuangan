"use server";

import { getUserSession } from "@/lib/session";
import { db } from "@/lib/db";
import { expenses } from "../schema";
import { eq, and, sql, gte, sum, lte, inArray } from "drizzle-orm";

import { getFamilyUserIdsOrThrow } from "./family.actions";
import { getISOWeek, getISOWeekYear } from "date-fns";
import { fetchExpensesByCategory, fetchSummaryStatistics } from "@/lib/actions/expense.actions";

async function getUserIdOrThrow() {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }
  return session;
}

export async function fetchDashboardSummary() {
  console.log("--- fetchDashboardSummary Request ---");
  const userIds = await getFamilyUserIdsOrThrow();
  try {
    const today = new Date().toISOString().split("T")[0];
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split("T")[0];

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const startOfMonthStr = startOfMonth.toISOString().split("T")[0];

    const todayPromise = db
      .select({ amount: sum(expenses.amount) })
      .from(expenses)
      .where(and(inArray(expenses.userId, userIds), eq(expenses.date, today)));
    const thisWeekPromise = db
      .select({ amount: sum(expenses.amount) })
      .from(expenses)
      .where(
        and(
          inArray(expenses.userId, userIds),
          gte(expenses.date, startOfWeekStr),
        ),
      );
    const thisMonthPromise = db
      .select({ amount: sum(expenses.amount), count: sql<number>`count(*)` })
      .from(expenses)
      .where(
        and(
          inArray(expenses.userId, userIds),
          gte(expenses.date, startOfMonthStr),
        ),
      );

    const [todayResult, thisWeekResult, thisMonthResult] = await Promise.all([
      todayPromise,
      thisWeekPromise,
      thisMonthPromise,
    ]);

    const todayTotal = Number(todayResult[0]?.amount) || 0;
    const thisWeekTotal = Number(thisWeekResult[0]?.amount) || 0;
    const thisMonthTotal = Number(thisMonthResult[0]?.amount) || 0;
    const thisMonthCount = Number(thisMonthResult[0]?.count) || 0;

    const response = {
      todayTotal,
      thisWeekTotal,
      thisMonthTotal,
      thisMonthCount,
    };
    console.log("--- fetchDashboardSummary Response ---", response);
    return response;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch dashboard summary.");
  }
}

export type TimeRange = "harian" | "mingguan" | "bulanan" | "tahunan";

export async function getChartData(timeRange: TimeRange) {
  console.log("--- getChartData Request ---", { timeRange });
  const userIds = await getFamilyUserIdsOrThrow();
  const now = new Date();

  let data: { category: string; total: number }[] = [];

  try {
    switch (timeRange) {
      case "harian":
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setUTCDate(today.getUTCDate() - 6);

        const dailyExpenses = await db
          .select({
            day: sql<string>`TO_CHAR(date, 'YYYY-MM-DD')`,
            total: sum(expenses.amount),
          })
          .from(expenses)
          .where(
            and(
              inArray(expenses.userId, userIds),
              gte(expenses.date, sevenDaysAgo.toISOString().split("T")[0]),
              lte(expenses.date, today.toISOString().split("T")[0])
            )
          )
          .groupBy(sql`TO_CHAR(date, 'YYYY-MM-DD')`)
          .orderBy(sql`TO_CHAR(date, 'YYYY-MM-DD')`);

        const dailyMap = new Map(dailyExpenses.map(e => [e.day, Number(e.total)]));
        data = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(sevenDaysAgo);
            date.setUTCDate(sevenDaysAgo.getUTCDate() + i);
            const dayString = date.toISOString().split("T")[0];
            return {
                category: date.toLocaleDateString('id-ID', { timeZone: 'UTC', weekday: 'short', day: 'numeric' }),
                total: dailyMap.get(dayString) || 0,
            };
        });
        break;

      case "mingguan":
        const fourWeeksAgo = new Date(now);
        fourWeeksAgo.setDate(now.getDate() - 27);
        fourWeeksAgo.setHours(0, 0, 0, 0);

        const weeklyExpenses = await db
          .select({
            week: sql<string>`TO_CHAR(date, 'IYYY-IW')`,
            total: sum(expenses.amount),
          })
          .from(expenses)
          .where(
            and(
              inArray(expenses.userId, userIds),
              gte(expenses.date, fourWeeksAgo.toISOString().split("T")[0])
            )
          )
          .groupBy(sql`TO_CHAR(date, 'IYYY-IW')`)
          .orderBy(sql`TO_CHAR(date, 'IYYY-IW')`);

        const weeklyMap = new Map(weeklyExpenses.map(e => [e.week, Number(e.total)]));
        data = [];
        for (let i = 3; i >= 0; i--) {
            const date = new Date();
            date.setDate(now.getDate() - i * 7);
            const isoWeekYear = getISOWeekYear(date);
            const isoWeek = getISOWeek(date);
            const weekString = `${isoWeekYear}-${String(isoWeek).padStart(2, '0')}`;

            const weekLabel = `Minggu ${4 - i}`;

            data.push({
                category: weekLabel,
                total: weeklyMap.get(weekString) || 0,
            });
        }
        break;

      case "bulanan":
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(now.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyExpenses = await db
          .select({
            month: sql<string>`TO_CHAR(date, 'YYYY-MM')`,
            total: sum(expenses.amount),
          })
          .from(expenses)
          .where(
            and(
              inArray(expenses.userId, userIds),
              gte(expenses.date, twelveMonthsAgo.toISOString().split("T")[0])
            )
          )
          .groupBy(sql`TO_CHAR(date, 'YYYY-MM')`)
          .orderBy(sql`TO_CHAR(date, 'YYYY-MM')`);
        
        const monthlyMap = new Map(monthlyExpenses.map(e => [e.month, Number(e.total)]));
        data = Array.from({ length: 12 }, (_, i) => {
            const date = new Date(twelveMonthsAgo);
            date.setMonth(date.getMonth() + i);
            const monthString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return {
                category: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
                total: monthlyMap.get(monthString) || 0,
            };
        });
        break;

      case "tahunan":
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const yearlyResult = await db
          .select({ total: sum(expenses.amount) })
          .from(expenses)
          .where(
            and(
              inArray(expenses.userId, userIds),
              gte(expenses.date, startOfYear.toISOString().split("T")[0])
            )
          );
        data = [
          {
            category: now.getFullYear().toString(),
            total: Number(yearlyResult[0]?.total) || 0,
          },
        ];
        break;
    }
  } catch (error) {
    console.error("Database Error getting chart data:", error);
    // Return empty data array on error
    return [];
  }

  console.log("--- getChartData Response ---", data);
  return data;
}

export async function getSpendingInsight(timeRange: TimeRange) {
  console.log("--- getSpendingInsight Request ---", { timeRange });
  const now = new Date();
  let fromDate, toDate, prevFromDate, prevToDate: Date;

  switch (timeRange) {
    case "harian":
      fromDate = new Date(now.setHours(0, 0, 0, 0));
      toDate = new Date(now.setHours(23, 59, 59, 999));
      prevFromDate = new Date(new Date().setDate(now.getDate() - 1));
      prevFromDate.setHours(0, 0, 0, 0);
      prevToDate = new Date(new Date().setDate(now.getDate() - 1));
      prevToDate.setHours(23, 59, 59, 999);
      break;
    case "mingguan":
      const firstDayOfWeek = new Date(
        now.setDate(now.getDate() - now.getDay()),
      );
      firstDayOfWeek.setHours(0, 0, 0, 0);
      fromDate = firstDayOfWeek;
      toDate = new Date(firstDayOfWeek);
      toDate.setDate(toDate.getDate() + 6);
      toDate.setHours(23, 59, 59, 999);

      prevFromDate = new Date(firstDayOfWeek);
      prevFromDate.setDate(prevFromDate.getDate() - 7);
      prevToDate = new Date(firstDayOfWeek);
      prevToDate.setDate(prevToDate.getDate() - 1);
      prevToDate.setHours(23, 59, 59, 999);
      break;
    case "bulanan":
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      toDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      prevFromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevToDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );
      break;
    case "tahunan":
      fromDate = new Date(now.getFullYear(), 0, 1);
      toDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      prevFromDate = new Date(now.getFullYear() - 1, 0, 1);
      prevToDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      break;
  }

  const [currentPeriodStats, previousPeriodStats, topCategoryData] =
    await Promise.all([
      fetchSummaryStatistics({
        from: fromDate.toISOString().split("T")[0],
        to: toDate.toISOString().split("T")[0],
      }),
      fetchSummaryStatistics({
        from: prevFromDate.toISOString().split("T")[0],
        to: prevToDate.toISOString().split("T")[0],
      }),
      fetchExpensesByCategory({
        from: fromDate.toISOString().split("T")[0],
        to: toDate.toISOString().split("T")[0],
      }),
    ]);

  const { total: currentTotal } = currentPeriodStats;
  const { total: previousTotal } = previousPeriodStats;

  let percentageChange = 0;
  if (previousTotal > 0) {
    percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100;
  } else if (currentTotal > 0) {
    percentageChange = 100;
  }

  const topCategory =
    topCategoryData.length > 0 ? topCategoryData[0].category : null;

  const response = {
    percentageChange: Math.round(percentageChange),
    topCategory,
    currentTotal,
  };
  console.log("--- getSpendingInsight Response ---", response);
  return response;
}
