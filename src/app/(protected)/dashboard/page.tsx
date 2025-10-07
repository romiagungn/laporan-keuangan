import {
  Activity,
  CreditCard,
  DollarSign,
  TrendingUp,
  UtensilsCrossed,
  Car,
  Receipt,
  Popcorn,
  Shirt,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Placeholder untuk chart, akan diintegrasikan dengan Recharts nanti
function PlaceholderChart() {
  return (
    <div className="w-full h-[300px] bg-muted/50 rounded-lg flex items-center justify-center border">
      <p className="text-sm text-muted-foreground">Chart placeholder</p>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>Tambah Pengeluaran</Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Bulan Ini</TabsTrigger>
          <TabsTrigger value="analytics">Tahun Ini</TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Semua
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pengeluaran Hari Ini
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 1.250.000</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% dari kemarin
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pengeluaran Minggu Ini
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 4.830.500</div>
                <p className="text-xs text-muted-foreground">
                  +12% dari minggu lalu
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pengeluaran Bulan Ini
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 12.234.000</div>
                <p className="text-xs text-muted-foreground">
                  -5.2% dari bulan lalu
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Transaksi
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">
                  +21 sejak bulan lalu
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <PlaceholderChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Pengeluaran Terbaru</CardTitle>
                <CardDescription>
                  Ada 5 transaksi baru bulan ini.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarFallback>
                        <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5">
                      <p className="text-sm font-medium leading-none">
                        Makan Siang
                      </p>
                      <p className="text-sm text-muted-foreground">KFC</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">Rp 55.000</p>
                    <Badge variant="outline" className="mt-1">
                      E-wallet
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarFallback>
                        <Car className="h-5 w-5 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5">
                      <p className="text-sm font-medium leading-none">
                        Transportasi
                      </p>
                      <p className="text-sm text-muted-foreground">Gojek</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">Rp 22.000</p>
                    <Badge variant="outline" className="mt-1">
                      E-wallet
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarFallback>
                        <Receipt className="h-5 w-5 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5">
                      <p className="text-sm font-medium leading-none">
                        Tagihan
                      </p>
                      <p className="text-sm text-muted-foreground">Listrik</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">Rp 250.000</p>
                    <Badge variant="outline" className="mt-1">
                      Transfer
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarFallback>
                        <Popcorn className="h-5 w-5 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5">
                      <p className="text-sm font-medium leading-none">
                        Hiburan
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tiket Bioskop
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">Rp 100.000</p>
                    <Badge variant="outline" className="mt-1">
                      Cash
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarFallback>
                        <Shirt className="h-5 w-5 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5">
                      <p className="text-sm font-medium leading-none">
                        Belanja
                      </p>
                      <p className="text-sm text-muted-foreground">Baju</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">Rp 350.000</p>
                    <Badge variant="outline" className="mt-1">
                      Credit Card
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
