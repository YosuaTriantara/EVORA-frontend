// CREATED: 2025-04-17 - New Team Registration Wizard
// Multi-step form for registering a new team to an event

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  Users,
  Trophy,
  UserPlus,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiGet, apiPost } from "@/lib/admin-api";
import { queryKeys } from "@/hooks/query-keys";
import { ApiErrorAlert } from "@/components/ui/api-error-alert";
import { cn } from "@/lib/utils";
import type { EventListItem, CategoryRead } from "@/types/event";

// Validation Schema
const MemberSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  role: z.enum(["CAPTAIN", "MEMBER"]),
  identity_number: z.string().optional(),
});

const RegistrationSchema = z.object({
  event_id: z.string().uuid("Pilih event terlebih dahulu"),
  category_id: z.string().uuid("Pilih kategori terlebih dahulu"),
  name: z.string().min(3, "Nama tim minimal 3 karakter").max(100, "Nama tim maksimal 100 karakter"),
  members: z.array(MemberSchema).min(1, "Minimal 1 anggota tim"),
});

type RegistrationInput = z.infer<typeof RegistrationSchema>;

const STEPS = [
  { id: 0, label: "Pilih Event", icon: Calendar },
  { id: 1, label: "Pilih Kategori", icon: Trophy },
  { id: 2, label: "Data Tim", icon: Users },
  { id: 3, label: "Konfirmasi", icon: Check },
];

interface TeamRegistrationResponse {
  id: string;
  name: string;
  event_id: string;
  category_id: string;
  status: string;
  message: string;
}

export default function NewRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(RegistrationSchema),
    defaultValues: {
      event_id: "",
      category_id: "",
      name: "",
      members: [{ name: "", role: "CAPTAIN", identity_number: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "members",
  });

  const selectedEventId = watch("event_id");
  const selectedCategoryId = watch("category_id");
  const teamName = watch("name");
  const members = watch("members");

  // Fetch available events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: queryKeys.events.all(),
    queryFn: () => apiGet<EventListItem[]>("/public/events"),
  });

  // Fetch categories for selected event
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: selectedEventId ? queryKeys.event(selectedEventId).categories() : [],
    queryFn: () => apiGet<CategoryRead[]>(`/public/events/${selectedEventId}/categories`),
    enabled: !!selectedEventId,
  });

  const selectedEvent = events?.find((e) => e.id === selectedEventId);
  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId);

  const { mutate, isPending, error } = useMutation<TeamRegistrationResponse, Error, RegistrationInput>({
    mutationFn: (data) => apiPost<TeamRegistrationResponse>("/registration/register", data),
    onSuccess: (data) => {
      router.push(`/dashboard/teams/${data.id}`);
    },
  });

  const onSubmit = (data: RegistrationInput) => {
    mutate(data);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!selectedEventId;
      case 1:
        return !!selectedCategoryId;
      case 2:
        return teamName.length >= 3 && members.length > 0 && members.every((m) => m.name.length >= 2);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1 && canProceed()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Step 1: Select Event
  const renderEventSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pilih Event</h3>
      {eventsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#681212]" />
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card
              key={event.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedEventId === event.id
                  ? "border-2 border-[#681212] bg-[#681212]/5"
                  : "border border-slate-200"
              )}
              onClick={() => setValue("event_id", event.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{event.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={event.status === "ACTIVE" ? "default" : "secondary"}>
                        {event.status}
                      </Badge>
                      {event.start_date && (
                        <span className="text-xs text-slate-500">
                          {new Date(event.start_date).toLocaleDateString("id-ID")}
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedEventId === event.id && (
                    <div className="w-6 h-6 rounded-full bg-[#681212] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          Tidak ada event yang tersedia saat ini.
        </div>
      )}
    </div>
  );

  // Step 2: Select Category
  const renderCategorySelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pilih Kategori</h3>
      {selectedEvent && (
        <p className="text-sm text-slate-600">
          Event: <span className="font-medium">{selectedEvent.name}</span>
        </p>
      )}
      {categoriesLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#681212]" />
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedCategoryId === category.id
                  ? "border-2 border-[#681212] bg-[#681212]/5"
                  : "border border-slate-200"
              )}
              onClick={() => setValue("category_id", category.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {category.team_size_min && category.team_size_max && (
                        <Badge variant="outline">
                          {category.team_size_min}-{category.team_size_max} anggota
                        </Badge>
                      )}
                      {category.registration_fee > 0 ? (
                        <Badge variant="secondary">
                          Rp {category.registration_fee.toLocaleString("id-ID")}
                        </Badge>
                      ) : (
                        <Badge variant="default">Gratis</Badge>
                      )}
                    </div>
                  </div>
                  {selectedCategoryId === category.id && (
                    <div className="w-6 h-6 rounded-full bg-[#681212] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          Tidak ada kategori tersedia untuk event ini.
        </div>
      )}
    </div>
  );

  // Step 3: Team Details
  const renderTeamDetails = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Data Tim</h3>
        {selectedEvent && selectedCategory && (
          <p className="text-sm text-slate-600 mt-1">
            {selectedEvent.name} - {selectedCategory.name}
          </p>
        )}
      </div>

      {/* Team Name */}
      <div className="space-y-2">
        <Label htmlFor="teamName">
          Nama Tim <span className="text-red-500">*</span>
        </Label>
        <Input
          id="teamName"
          placeholder="Masukkan nama tim"
          className={cn(errors.name && "border-red-500")}
          {...register("name")}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <Separator />

      {/* Members */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Anggota Tim</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", role: "MEMBER", identity_number: "" })}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Tambah Anggota
          </Button>
        </div>

        {fields.map((field, index) => (
          <Card key={field.id} className="border border-slate-200">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={index === 0 ? "default" : "secondary"}>
                  {index === 0 ? "Ketua" : `Anggota ${index + 1}`}
                </Badge>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <input type="hidden" {...register(`members.${index}.role`)} value={index === 0 ? "CAPTAIN" : "MEMBER"} />

              <div className="space-y-2">
                <Label htmlFor={`member-${index}-name`}>Nama Lengkap</Label>
                <Input
                  id={`member-${index}-name`}
                  placeholder="Nama lengkap anggota"
                  {...register(`members.${index}.name`)}
                />
                {errors.members?.[index]?.name && (
                  <p className="text-sm text-red-500">{errors.members[index]?.name?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`member-${index}-identity`}>Nomor Identitas (Opsional)</Label>
                <Input
                  id={`member-${index}-identity`}
                  placeholder="NIM/NISN/NIK"
                  {...register(`members.${index}.identity_number`)}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {errors.members && typeof errors.members.message === "string" && (
          <p className="text-sm text-red-500">{errors.members.message}</p>
        )}
      </div>
    </div>
  );

  // Step 4: Confirmation
  const renderConfirmation = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Konfirmasi Pendaftaran</h3>

      <Card className="border border-slate-200">
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="text-sm text-slate-500">Event</p>
            <p className="font-medium">{selectedEvent?.name}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-slate-500">Kategori</p>
            <p className="font-medium">{selectedCategory?.name}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-slate-500">Nama Tim</p>
            <p className="font-medium">{teamName}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-slate-500">Anggota Tim</p>
            <ul className="mt-2 space-y-1">
              {members.map((member, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                    {index === 0 ? "Ketua" : "Anggota"}
                  </Badge>
                  <span>{member.name}</span>
                </li>
              ))}
            </ul>
          </div>
          {selectedCategory && selectedCategory.registration_fee > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-slate-500">Biaya Pendaftaran</p>
                <p className="font-medium text-lg">
                  Rp {selectedCategory.registration_fee.toLocaleString("id-ID")}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {error && <ApiErrorAlert error={error} />}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Pendaftaran Tim Baru</CardTitle>
          <CardDescription>
            Daftarkan tim Anda untuk berpartisipasi dalam event
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        isActive && "bg-[#681212] text-white",
                        isCompleted && "bg-green-500 text-white",
                        !isActive && !isCompleted && "bg-slate-200 text-slate-600"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs mt-2 font-medium",
                        isActive && "text-[#681212]",
                        isCompleted && "text-green-600",
                        !isActive && !isCompleted && "text-slate-500"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Progress Bar */}
            <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#681212] transition-all duration-300"
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 0 && renderEventSelection()}
            {currentStep === 1 && renderCategorySelection()}
            {currentStep === 2 && renderTeamDetails()}
            {currentStep === 3 && renderConfirmation()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-[#681212] hover:bg-[#8a1a1a]"
                >
                  Lanjut
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#681212] hover:bg-[#8a1a1a]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mendaftarkan...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Daftar Tim
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
