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
import { useCoursesStore } from '@/lib/stores/courses';

export function CourseFilters() {
  const {
    courses,
    searchQuery,
    selectedSemester,
    selectedClass,
    availableClasses,
    setSearchQuery,
    setSelectedSemester,
    setSelectedClass,
    handleExportAll,
    setShowImportModal,
    handleAddCourse,
  } = useCoursesStore();

  const availClasses = availableClasses();

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main Controls Row */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search and Filters */}
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Cari mata kuliah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full pl-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:flex">
                <Select
                  value={selectedSemester}
                  onValueChange={setSelectedSemester}
                >
                  <SelectTrigger className="h-10 w-full sm:w-48">
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
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-10 w-full sm:w-40">
                    <SelectValue placeholder="Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {availClasses.map((classOption) => (
                      <SelectItem key={classOption} value={classOption}>
                        Kelas {classOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <Button
                variant="outline"
                onClick={handleExportAll}
                disabled={courses.length === 0}
                size="sm"
                className="h-10 w-full px-3 sm:w-auto disabled:opacity-50"
              >
                <Upload className="mr-1 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowImportModal(true)}
                size="sm"
                className="h-10 w-full px-3 sm:w-auto"
              >
                <Download className="mr-1 h-4 w-4" />
                Import
              </Button>
              <Button
                onClick={handleAddCourse}
                className="col-span-2 h-10 w-full bg-primary px-4 sm:col-auto sm:w-auto"
                size="sm"
              >
                <Plus className="mr-1 h-4 w-4" />
                Tambah
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
