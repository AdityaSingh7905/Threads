"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { ThreadsValidation } from "@/lib/validations/threads";
import { usePathname, useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

function PostThread({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { organization } = useOrganization();

  const form = useForm<z.infer<typeof ThreadsValidation>>({
    resolver: zodResolver(ThreadsValidation),
    defaultValues: {
      thread: "",
      accountId: userId,
    },
  });

  const [aiPrompt, setAiPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const generateWithGemini = async () => {
    setLoading(true);

    const res = await fetch("/api/gemini-thread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aiPrompt),
    });

    const data = await res.json();
    console.log("Gemini Data: ", data.text);

    setAiPrompt("");
    setLoading(false);
    setShowDialog(false);

    if (data.text) {
      form.setValue("thread", data.text);
    }
  };

  async function onSubmit(values: z.infer<typeof ThreadsValidation>) {
    const res = await fetch(`${BACKEND_URL}/thread/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: values.thread,
        author: userId,
        communityId: organization ? organization.id : null,
        path: pathname,
      }),
    });

    if (!res.ok) {
      throw new Error("Error creating post...");
    }

    router.push("/");
    router.refresh();
  }

  return (
    <>
      <div className="mb-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              onClick={(e) => setShowDialog(true)}
              className="bg-primary-500 text-white"
            >
              Use Gemini Assist
            </Button>
          </DialogTrigger>

          {showDialog && (
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Generate Thread with Gemini</DialogTitle>
              </DialogHeader>

              <Textarea
                rows={5}
                placeholder="Describe what you want Gemini to write..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />

              <Button
                disabled={loading}
                onClick={generateWithGemini}
                className="mt-4 bg-gray-800 text-white"
              >
                {loading ? "Generating..." : "Generate"}
              </Button>
            </DialogContent>
          )}
        </Dialog>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 flex flex-col justify-start gap-10"
        >
          <FormField
            control={form.control}
            name="thread"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full gap-3">
                <FormLabel className="text-base-semibold text-light-2">
                  Content
                </FormLabel>
                <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                  <Textarea rows={15} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="bg-primary-500 text-white">
            Post Thread
          </Button>
        </form>
      </Form>
    </>
  );
}

export default PostThread;
