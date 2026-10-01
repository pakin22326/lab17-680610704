import { useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  createCourseFormSchema,
  type CourseFormValues,
} from "@/lib/schemas/course-schema";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import type { Course } from "@/lib/types";
/**
 *   (Lab 17): เขียนฟอร์มนี้ใหม่ด้วย Zod + React Hook Form
 *   (ดูตัวอย่างใน components/students/add-new-student-dialog.tsx)
 *   - schema ใหม่ที่ src/lib/schemas/course-schema.ts (แทน course-validation.ts)
 *   - ผู้สอนเป็น Array Fields (useFieldArray) — ชื่อ + อีเมล @cmu.ac.th, 1–3 คน
 *   - หลักสูตร (Select), ภาคการศึกษา (Radio Group), รายละเอียด (Textarea 0/100),
 *     รับข่าวสารทางอีเมล (Switch)
 */
const defaultValues: CourseFormValues = {
  courseId: "",
  courseTitle: "",
  instructors: [
    {
      name: "",
      email: "",
    },
  ],
  program: undefined as never,
  semester: undefined as never,
  description: "",
  notifyByEmail: false,
};

const programItems = [
  {
    value: "CPE",
    label: "CPE — วิศวกรรมคอมพิวเตอร์",
  },
  {
    value: "ISNE",
    label: "ISNE — วิศวกรรมระบบสารสนเทศและเครือข่าย",
  },
];

const semesterItems = [
  {
    value: "1",
    label: "ภาคการศึกษาที่ 1",
  },
  {
    value: "2",
    label: "ภาคการศึกษาที่ 2",
  },
  {
    value: "3",
    label: "ภาคฤดูร้อน",
  },
];

export function AddNewCourseDialog() {
  const [open, setOpen] = useState(false);

  const courses = useEnrollmentStore((state) => state.courses);
  const addCourse = useEnrollmentStore((state) => state.addCourse);

  const schema = useMemo(() => createCourseFormSchema(courses), [courses]);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "instructors",
  });

  const description = useWatch({
    control: form.control,
    name: "description",
  });

  const descriptionLength = description?.length ?? 0;

  const instructorsRootError = form.formState.errors.instructors?.root;

  const resetForm = () => {
    form.reset(defaultValues);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = (values: CourseFormValues) => {
    const course: Course = {
      courseId: values.courseId,
      courseTitle: values.courseTitle,
      instructors: values.instructors,
      program: values.program,
      semester: values.semester,
      description: values.description,
      notifyByEmail: values.notifyByEmail,
    };

    addCourse(course);

    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <PlusCircle className="h-4 w-4" />
        เพิ่มวิชา
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
          className="grid gap-5"
        >
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลวิชา ผู้สอน หลักสูตร และภาคการศึกษา
            </DialogDescription>
          </DialogHeader>

          {/* รหัสวิชา */}
          <Controller
            name="courseId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="courseId">รหัสวิชา</FieldLabel>

                <Input
                  {...field}
                  id="courseId"
                  placeholder="เช่น 261305"
                  inputMode="numeric"
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* ชื่อวิชา */}
          <Controller
            name="courseTitle"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="courseTitle">ชื่อวิชา</FieldLabel>

                <Input
                  {...field}
                  id="courseTitle"
                  placeholder="เช่น Mobile Application Development"
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* หลักสูตร */}
          <Controller
            name="program"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="program">หลักสูตร</FieldLabel>

                <Select
                  items={programItems}
                  value={field.value ?? null}
                  onValueChange={(value) => {
                    field.onChange(value);
                    field.onBlur();
                  }}
                >
                  <SelectTrigger id="program" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="เลือกหลักสูตร" />
                  </SelectTrigger>

                  <SelectContent>
                    {programItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* ภาคการศึกษา */}
          <Controller
            name="semester"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>ภาคการศึกษา</FieldLabel>

                <RadioGroup
                  value={field.value ?? ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    field.onBlur();
                  }}
                  className="grid gap-2"
                >
                  {semesterItems.map((item) => (
                    <div key={item.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        id={`semester-${item.value}`}
                        value={item.value}
                        aria-invalid={fieldState.invalid}
                      />

                      <FieldLabel
                        htmlFor={`semester-${item.value}`}
                        className="font-normal"
                      >
                        {item.label}
                      </FieldLabel>
                    </div>
                  ))}
                </RadioGroup>

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* รายละเอียด */}
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="description">รายละเอียด(ไม่บังคับ)</FieldLabel>

                <Textarea
                  {...field}
                  id="description"
                  placeholder="คำอธิบายสั้น ๆ ของวิชา"
                  maxLength={100}
                  aria-invalid={fieldState.invalid}
                />

                <div
                  className={
                    descriptionLength > 100
                      ? "text-sm text-destructive"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {descriptionLength}/100 ตัวอักษร
                </div>

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* ผู้สอน */}
          <Field data-invalid={!!instructorsRootError}>
            <FieldLabel>
              <div>
                <div>ผู้สอน</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {fields.length}/3 คน — กรอกชื่อผู้สอน และอีเมล name@cmu.ac.th (ห้ามซ้ำกัน)
                </div>
              </div>
            </FieldLabel>

            <div className="grid gap-3">
              {fields.map((item, index) => (
                <div key={item.id} className="flex items-start gap-2">
                  <div className="flex h-10 w-8 items-center justify-center text-sm font-medium">
                    {index + 1}.
                  </div>

                  <div className="grid flex-1 gap-2 sm:grid-cols-2">
                    <Controller
                      name={`instructors.${index}.name`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Input
                            {...field}
                            placeholder="กรอกชื่อผู้สอน"
                            aria-invalid={fieldState.invalid}
                          />

                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      name={`instructors.${index}.email`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Input
                            {...field}
                            type="email"
                            placeholder="name@cmu.ac.th"
                            aria-invalid={fieldState.invalid}
                          />

                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`ลบผู้สอนคนที่ ${index + 1}`}
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {instructorsRootError && (
                <FieldError errors={[instructorsRootError]} />
              )}

              <Button
                type="button"
                variant="outline"
                className="w-fit"
                disabled={fields.length >= 3}
                onClick={() =>
                  append({
                    name: "",
                    email: "",
                  })
                }
              >
                + เพิ่มผู้สอน
              </Button>
            </div>
          </Field>

          {/* รับข่าวสารทางอีเมล */}
          <Controller
            name="notifyByEmail"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal" className="rounded-lg border p-4">
                <Switch
                  id="notifyByEmail"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />

                <div className="grid gap-1">
                  <FieldLabel htmlFor="notifyByEmail">
                    รับข่าวสารทางอีเมล
                  </FieldLabel>

                  <p className="text-sm text-muted-foreground">
                    แจ้งเตือนผู้สอนเมื่อเปิดลงทะเบียน
                  </p>
                </div>
              </Field>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              <RotateCcw className="h-4 w-4" />
              รีเซ็ต
            </Button>

            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
