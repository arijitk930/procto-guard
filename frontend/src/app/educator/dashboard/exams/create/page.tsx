"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { examSchema, ExamFormValues } from "@/lib/validations/exam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

import { useMutation } from "@tanstack/react-query";
import { examApi } from "@/api/exam.api";
import { useRouter } from "next/navigation";

export default function CreateExamPage() {
  const router = useRouter();
  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      description: "",
      timeLimit: 30,
      passingScore: 10,
      questions: [
        {
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          marks: 1,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  // Create the mutation
  const createExamMutation = useMutation({
    mutationFn: examApi.createExam,
    onSuccess: () => {
      toast.success("Exam published successfully!");
      router.push("/educator/dashboard"); // Send them back to see their new exam
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
    },
  });

  const onSubmit = async (data: ExamFormValues) => {
    // This triggers the backend call
    createExamMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Create New Exam</h1>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="mr-2 h-4 w-4" /> Save Exam
        </Button>
      </div>

      <form className="space-y-8">
        {/* Step 1: Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Input
                placeholder="Exam Title (e.g. Algorithms Midterm)"
                {...form.register("title")}
              />
              <Textarea
                placeholder="Instructions for students..."
                {...form.register("description")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Duration (Minutes)
                </label>
                <Input
                  type="number"
                  min="1"
                  {...form.register("timeLimit", { valueAsNumber: true })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Passing Score</label>
                <Input
                  type="number"
                  min="1"
                  {...form.register("passingScore", { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Questions Bank</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  questionText: "",
                  options: ["", "", "", ""],
                  correctAnswer: "",
                  marks: 1,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id} className="relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">
                  Question {index + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter question text..."
                  {...form.register(`questions.${index}.questionText`)}
                />
                <div className="grid grid-cols-2 gap-3">
                  {field.options.map((_, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-500 shrink-0 border dark:border-slate-700">
                        {optIndex + 1}
                      </span>
                      <Input
                        placeholder={`Option text...`}
                        {...form.register(
                          `questions.${index}.options.${optIndex}`,
                        )}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Correct Answer (Exact string)"
                    {...form.register(`questions.${index}.correctAnswer`)}
                  />
                  <Input
                    type="number"
                    min="1"
                    placeholder="Marks"
                    {...form.register(`questions.${index}.marks`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </form>
    </div>
  );
}
