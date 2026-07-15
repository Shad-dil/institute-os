"use client";

import { useRef, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import {
  uploadLogo,
  uploadSignature,
  updateSignatoryName,
} from "@/lib/action/institute-settings-actions";
import { toast } from "sonner";

interface InstituteBrandingFormProps {
  logoUrl: string | null;
  signatureUrl: string | null;
  signatoryName: string | null;
}

function ImageUploadField({
  label,
  currentUrl,
  onUpload,
  helpText,
}: {
  label: string;
  currentUrl: string | null;
  onUpload: (
    formData: FormData,
  ) => Promise<{ success: boolean; error?: string }>;
  helpText: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await onUpload(formData);
      if (result.success) {
        setPreview(URL.createObjectURL(file));
        toast.success(`${label} updated`);
      } else {
        toast.error(result.error ?? "Upload failed");
      }
    });
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {preview ? (
            // Institute-uploaded image, not user-facing content needing optimization — plain img is fine here
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt={label}
              className="h-full w-full object-contain"
            />
          ) : (
            <Upload className="h-5 w-5 text-slate-300" />
          )}
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {isPending ? "Uploading…" : preview ? "Replace" : "Upload"}
          </Button>
          <p className="mt-1 text-xs text-slate-400">{helpText}</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

export function InstituteBrandingForm({
  logoUrl,
  signatureUrl,
  signatoryName,
}: InstituteBrandingFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSignatoryNameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateSignatoryName(formData);
      if (result.success) toast.success("Saved");
      else toast.error(result.error ?? "Couldn't save");
    });
  }

  return (
    <Card className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Receipt Branding
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Shown on every printed/downloaded fee receipt.
        </p>
      </div>

      <ImageUploadField
        label="Institute Logo"
        currentUrl={logoUrl}
        onUpload={uploadLogo}
        helpText="PNG or JPG, under 2MB. Shown top-left on receipts."
      />

      <ImageUploadField
        label="Signature (optional)"
        currentUrl={signatureUrl}
        onUpload={uploadSignature}
        helpText="A photo of a pen signature works fine. Leave blank to print a blank signature line instead."
      />

      <form onSubmit={handleSignatoryNameSubmit} className="space-y-1.5">
        <Label htmlFor="signatoryName">Signatory Name &amp; Title</Label>
        <div className="flex gap-2">
          <Input
            id="signatoryName"
            name="signatoryName"
            defaultValue={signatoryName ?? ""}
            placeholder="e.g. Ravi Kumar, Director"
          />
          <Button type="submit" variant="outline" disabled={isPending}>
            Save
          </Button>
        </div>
        <p className="text-xs text-slate-400">
          Printed under the signature line on receipts.
        </p>
      </form>
    </Card>
  );
}
