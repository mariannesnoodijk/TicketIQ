import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  className?: string;
};

export function TableSkeleton({ rows = 8, columns = 5, className }: TableSkeletonProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className={cn("h-4", colIndex === 0 ? "w-48" : "w-16")} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

type ChartAreaSkeletonProps = {
  className?: string;
};

export function ChartAreaSkeleton({ className }: ChartAreaSkeletonProps) {
  return <Skeleton className={cn("h-72 w-full rounded-lg", className)} />;
}

export function PieChartSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartAreaSkeleton />
      <div className="flex flex-col justify-center gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full max-w-xs" />
        ))}
      </div>
    </div>
  );
}

export function ChatPanelSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="gap-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-36" />
        </CardContent>
      </Card>
      <Card className="min-h-[28rem]">
        <CardHeader className="gap-3 pb-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-4/5 rounded-xl" />
          <Skeleton className="mt-auto h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
