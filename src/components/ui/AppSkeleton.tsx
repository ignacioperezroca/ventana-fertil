"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function AppSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 px-4 py-4 pb-28 sm:px-6 sm:py-6 lg:gap-6 lg:pb-16" aria-busy="true">
      <section className="rounded-[34px] border border-app-border bg-white/92 p-4 shadow-[0_24px_70px_-46px_rgba(36,22,47,0.42)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-8 w-[min(28rem,80vw)] rounded-2xl" />
            <Skeleton className="h-4 w-[min(34rem,90vw)] rounded-full" />
            <Skeleton className="h-4 w-[min(22rem,70vw)] rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </section>

      <section className="rounded-[34px] border border-app-border bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_24px_70px_-46px_rgba(36,22,47,0.42)] sm:p-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-8 w-[min(30rem,84vw)] rounded-2xl" />
          <Skeleton className="h-4 w-[min(26rem,76vw)] rounded-full" />
        </div>

        <div className="mt-5 grid gap-4">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-20 rounded-full" />
            <Skeleton className="h-10 w-20 rounded-full" />
            <Skeleton className="h-10 w-20 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-16 rounded-full" />
            <Skeleton className="h-10 w-16 rounded-full" />
            <Skeleton className="h-10 w-16 rounded-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </section>

      <section className="rounded-[34px] border border-app-border bg-white/92 p-4 shadow-[0_24px_70px_-46px_rgba(36,22,47,0.42)] sm:p-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-7 w-[min(24rem,70vw)] rounded-2xl" />
          <Skeleton className="h-4 w-[min(32rem,86vw)] rounded-full" />
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="h-44 w-full rounded-[30px]" />
          <div className="grid gap-3">
            <Skeleton className="h-24 w-full rounded-[24px]" />
            <Skeleton className="h-24 w-full rounded-[24px]" />
            <Skeleton className="h-11 w-full rounded-full" />
          </div>
        </div>
      </section>
    </main>
  );
}
