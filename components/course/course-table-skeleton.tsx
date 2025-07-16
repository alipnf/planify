import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseTableSkeletonProps {
  rows?: number;
}

export function CourseTableSkeleton({ rows = 5 }: CourseTableSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <div className="flex items-center justify-center">
                    <Skeleton className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-12" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-12" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="w-24">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rows }).map((_, index) => (
                <TableRow key={index}>
                  {/* Checkbox */}
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Skeleton className="h-4 w-4" />
                    </div>
                  </TableCell>

                  {/* Kode */}
                  <TableCell>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </TableCell>

                  {/* Kelas */}
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>

                  {/* Mata Kuliah */}
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>

                  {/* Dosen */}
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>

                  {/* SKS */}
                  <TableCell>
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </TableCell>

                  {/* Jadwal */}
                  <TableCell>
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </TableCell>

                  {/* Ruang */}
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>

                  {/* Kategori */}
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex space-x-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
