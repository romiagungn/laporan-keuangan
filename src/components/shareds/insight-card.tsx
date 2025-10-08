'use client';

import { ArrowDown, ArrowUp, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';



interface InsightCardProps {
  isLoading: boolean;
  insight: {
    percentageChange: number;
    topCategory: string | null;
    currentTotal: number;
  } | null;
}

export function InsightCard({ isLoading, insight }: InsightCardProps) {
  const renderContent = () => {
    if (isLoading) {
      return <p className="text-muted-foreground">Menganalisis data...</p>;
    }

    if (!insight || insight.currentTotal === 0) {
      return <p className="text-muted-foreground">Belum ada data yang cukup untuk dianalisis.</p>;
    }

    const { percentageChange, topCategory } = insight;
    const isIncrease = percentageChange > 0;
    const isDecrease = percentageChange < 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center">
          {isIncrease && <ArrowUp className="h-6 w-6 text-red-500 mr-2" />}
          {isDecrease && <ArrowDown className="h-6 w-6 text-green-500 mr-2" />}
          <p className="text-lg">
            Pengeluaran Anda{' '}
            <span className={isIncrease ? 'font-bold text-red-500' : isDecrease ? 'font-bold text-green-500' : 'font-bold'}>
              {isIncrease ? 'naik' : isDecrease ? 'turun' : ""} {Math.abs(percentageChange)}%
            </span>{' '}
            dibandingkan periode sebelumnya.
          </p>
        </div>
        {topCategory && (
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
            <p className="text-lg">
              Kategori pengeluaran terbesar Anda adalah <span className="font-bold">{topCategory}</span>.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Insight Pengeluaran</CardTitle>
        <CardDescription>Analisis otomatis pengeluaran Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full flex flex-col justify-center bg-muted/10 p-6 rounded-lg">
          {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
}
