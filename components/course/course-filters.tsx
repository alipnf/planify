import { Search, Upload, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface CourseFiltersProps {
  searchQuery: string;
  selectedSemester: string;
  selectedClass: string;
  groupByCode: boolean;
  availableClasses: string[];
  onSearchChange: (query: string) => void;
  onSemesterChange: (semester: string) => void;
  onClassChange: (classValue: string) => void;
  onGroupByCodeChange: (group: boolean) => void;
  onExport: () => void;
  onImport: () => void;
  onAddCourse: () => void;
}

export function CourseFilters({
  searchQuery,
  selectedSemester,
  selectedClass,
  groupByCode,
  availableClasses,
  onSearchChange,
  onSemesterChange,
  onClassChange,
  onGroupByCodeChange,
  onExport,
  onImport,
  onAddCourse,
}: CourseFiltersProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main Controls Row */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search and Filters - Left Side */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search Input */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari mata kuliah..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>

              {/* Semester Filter */}
              <div className="w-full sm:w-48">
                <Select
                  value={selectedSemester}
                  onValueChange={onSemesterChange}
                >
                  <SelectTrigger className="h-10 px-3">
                    <SelectValue placeholder="Pilih Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Semester</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Class Filter */}
              <div className="w-full sm:w-32">
                <Select value={selectedClass} onValueChange={onClassChange}>
                  <SelectTrigger className="h-10 px-3">
                    <SelectValue placeholder="Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {availableClasses.map((classOption) => (
                      <SelectItem key={classOption} value={classOption}>
                        Kelas {classOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons - Right Side */}
            <div className="flex flex-wrap gap-2 lg:flex-nowrap">
              <Button
                variant="outline"
                onClick={onExport}
                size="sm"
                className="h-10 px-3"
              >
                <Upload className="h-4 w-4 mr-1" />
                Export
              </Button>

              <Button
                variant="outline"
                onClick={onImport}
                size="sm"
                className="h-10 px-3"
              >
                <Download className="h-4 w-4 mr-1" />
                Import
              </Button>

              <Button
                onClick={onAddCourse}
                className="bg-primary h-10 px-4"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </div>
          </div>

          {/* View Options Row */}
          <div className="flex items-center pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="group-by-code"
                checked={groupByCode}
                onCheckedChange={(checked) =>
                  onGroupByCodeChange(checked as boolean)
                }
              />
              <label
                htmlFor="group-by-code"
                className="text-sm font-medium text-gray-700"
              >
                Kelompokkan berdasarkan kode mata kuliah
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
