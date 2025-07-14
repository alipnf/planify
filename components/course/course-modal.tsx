import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { toast } from 'sonner';

import {
  createCourseSchema,
  type CreateCourseFormData,
} from '@/lib/schemas/course';

import { useCoursesStore } from '@/lib/stores/courses';

export function CourseModal() {
  const {
    showCourseModal,
    setShowCourseModal,
    editingCourse,
    handleSaveCourse,
    isSaving,
  } = useCoursesStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
  });

  const watchedValues = watch();

  useEffect(() => {
    if (editingCourse) {
      // Pre-fill form with course data
      setValue('code', editingCourse.code);
      setValue('name', editingCourse.name);
      setValue('lecturer', editingCourse.lecturer);
      setValue('credits', editingCourse.credits);
      setValue('room', editingCourse.room);
      setValue('day', editingCourse.day);
      // Convert time format from HH:MM:SS to HH:MM for time inputs
      setValue('startTime', editingCourse.startTime.substring(0, 5));
      setValue('endTime', editingCourse.endTime.substring(0, 5));
      setValue('semester', editingCourse.semester);
      setValue('category', editingCourse.category);
      setValue('class', editingCourse.class);
    } else {
      // Reset form for new course
      reset();
    }
  }, [editingCourse, setValue, reset]);

  const onSubmit = async (data: CreateCourseFormData) => {
    // Validate time logic
    const startTime = new Date(`2000-01-01T${data.startTime}:00`);
    const endTime = new Date(`2000-01-01T${data.endTime}:00`);

    if (endTime <= startTime) {
      toast.error('Jam selesai harus lebih besar dari jam mulai');
      return;
    }

    await handleSaveCourse(data);
  };

  return (
    <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
          </DialogTitle>
          <DialogDescription>
            {editingCourse
              ? 'Perbarui informasi mata kuliah'
              : 'Tambahkan mata kuliah baru ke dalam sistem'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Course Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Kode Mata Kuliah *</Label>
              <Input id="code" placeholder="CS101" {...register('code')} />
              {errors.code && (
                <p className="text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>

            {/* Class - Now as string input */}
            <div className="space-y-2">
              <Label htmlFor="class">Kelas *</Label>
              <Input
                id="class"
                placeholder="A, B, C, AA, BB, dll"
                {...register('class')}
              />
              {errors.class && (
                <p className="text-sm text-red-600">{errors.class.message}</p>
              )}
            </div>

            {/* Semester */}
            <div className="space-y-2">
              <Label htmlFor="semester">Semester *</Label>
              <Select
                onValueChange={(value) => setValue('semester', value)}
                value={watchedValues.semester}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.semester && (
                <p className="text-sm text-red-600">
                  {errors.semester.message}
                </p>
              )}
            </div>
          </div>

          {/* Course Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Mata Kuliah *</Label>
            <Input
              id="name"
              placeholder="Algoritma dan Pemrograman Dasar"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lecturer */}
            <div className="space-y-2">
              <Label htmlFor="lecturer">Dosen Pengampu *</Label>
              <Input
                id="lecturer"
                placeholder="Dr. Ahmad Rizki"
                {...register('lecturer')}
              />
              {errors.lecturer && (
                <p className="text-sm text-red-600">
                  {errors.lecturer.message}
                </p>
              )}
            </div>

            {/* Credits - Now as input field */}
            <div className="space-y-2">
              <Label htmlFor="credits">SKS *</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                max="20"
                placeholder="3"
                {...register('credits', { valueAsNumber: true })}
              />
              {errors.credits && (
                <p className="text-sm text-red-600">{errors.credits.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Day */}
            <div className="space-y-2">
              <Label htmlFor="day">Hari *</Label>
              <Select
                onValueChange={(value) => setValue('day', value)}
                value={watchedValues.day}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih hari" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Senin">Senin</SelectItem>
                  <SelectItem value="Selasa">Selasa</SelectItem>
                  <SelectItem value="Rabu">Rabu</SelectItem>
                  <SelectItem value="Kamis">Kamis</SelectItem>
                  <SelectItem value="Jumat">Jumat</SelectItem>
                  <SelectItem value="Sabtu">Sabtu</SelectItem>
                  <SelectItem value="Minggu">Minggu</SelectItem>
                </SelectContent>
              </Select>
              {errors.day && (
                <p className="text-sm text-red-600">{errors.day.message}</p>
              )}
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="startTime">Jam Mulai *</Label>
              <Input id="startTime" type="time" {...register('startTime')} />
              {errors.startTime && (
                <p className="text-sm text-red-600">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="endTime">Jam Selesai *</Label>
              <Input id="endTime" type="time" {...register('endTime')} />
              {errors.endTime && (
                <p className="text-sm text-red-600">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room */}
            <div className="space-y-2">
              <Label htmlFor="room">Ruang *</Label>
              <Input
                id="room"
                placeholder="Lab Komputer 1"
                {...register('room')}
              />
              {errors.room && (
                <p className="text-sm text-red-600">{errors.room.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                onValueChange={(value) =>
                  setValue('category', value as 'wajib' | 'pilihan')
                }
                value={watchedValues.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wajib">Mata Kuliah Wajib</SelectItem>
                  <SelectItem value="pilihan">Mata Kuliah Pilihan</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCourseModal(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? 'Menyimpan...'
                : editingCourse
                  ? 'Perbarui'
                  : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
