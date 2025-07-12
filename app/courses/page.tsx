'use client';

import { CourseModal } from '@/components/course/course-modal';
import { ImportCoursesModal } from '@/components/course/import-course-modal';
import { CourseFilters } from '@/components/course/course-filters';
import { CourseTable } from '@/components/course/course-table';
import { CourseEmptyState } from '@/components/course/course-empty-state';
import { CourseDeleteDialogs } from '@/components/course/course-delete-dialogs';
import { CourseTableSkeleton } from '@/components/course/course-table-skeleton';
import { useCourses } from '@/lib/hooks/use-courses';

export default function CoursesPage() {
  const {
    searchQuery,
    selectedSemester,
    selectedClass,
    groupByCode,
    availableClasses,
    setSearchQuery,
    setSelectedSemester,
    setSelectedClass,
    setGroupByCode,
    handleExportAll,
    setShowImportModal,
    handleAddCourse,
    isLoading,
    filteredCourses,
    hasFilters,
    selectedCourses,
    handleSelectAll,
    handleSelectCourse,
    handleEditCourse,
    handleDeleteCourseClick,
    handleBulkDeleteClick,
    allSelected,
    someSelected,
    groupedCourses,
    showCourseModal,
    setShowCourseModal,
    editingCourse,
    handleSaveCourse,
    showImportModal,
    handleImportCourses,
    showDeleteDialog,
    courseToDelete,
    setShowDeleteDialog,
    handleConfirmDelete,
    showBulkDeleteDialog,
    selectedCourseNames,
    setShowBulkDeleteDialog,
    handleConfirmBulkDelete,
    isSaving,
  } = useCourses();

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Semua Mata Kuliah
            </h1>
            <p className="text-gray-600">
              Kelola daftar mata kuliah yang ditawarkan untuk semester ini
            </p>
          </div>

          {/* Filters */}
          <CourseFilters
            searchQuery={searchQuery}
            selectedSemester={selectedSemester}
            selectedClass={selectedClass}
            groupByCode={groupByCode}
            availableClasses={availableClasses}
            onSearchChange={setSearchQuery}
            onSemesterChange={setSelectedSemester}
            onClassChange={setSelectedClass}
            onGroupByCodeChange={setGroupByCode}
            onExport={handleExportAll}
            onImport={() => setShowImportModal(true)}
            onAddCourse={handleAddCourse}
          />

          {/* Course Table, Loading State, or Empty State */}
          {isLoading ? (
            <CourseTableSkeleton rows={8} />
          ) : filteredCourses.length === 0 ? (
            <CourseEmptyState
              hasFilters={hasFilters}
              onAddCourse={handleAddCourse}
              onImport={() => setShowImportModal(true)}
            />
          ) : (
            <CourseTable
              courses={filteredCourses}
              selectedCourses={selectedCourses}
              onSelectAll={handleSelectAll}
              onSelectCourse={handleSelectCourse}
              onEditCourse={handleEditCourse}
              onDeleteCourse={handleDeleteCourseClick}
              onBulkDelete={handleBulkDeleteClick}
              allSelected={allSelected}
              someSelected={someSelected}
              groupByCode={groupByCode}
              groupedCourses={groupedCourses}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <CourseModal
        open={showCourseModal}
        onOpenChange={setShowCourseModal}
        course={editingCourse}
        onSave={handleSaveCourse}
        isSaving={isSaving}
      />

      <ImportCoursesModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImport={handleImportCourses}
      />

      {/* Delete Dialogs */}
      <CourseDeleteDialogs
        showDeleteDialog={showDeleteDialog}
        courseToDelete={courseToDelete}
        onDeleteDialogChange={setShowDeleteDialog}
        onConfirmDelete={handleConfirmDelete}
        showBulkDeleteDialog={showBulkDeleteDialog}
        selectedCourseNames={selectedCourseNames}
        selectedCount={selectedCourses.length}
        onBulkDeleteDialogChange={setShowBulkDeleteDialog}
        onConfirmBulkDelete={handleConfirmBulkDelete}
      />
    </>
  );
}
