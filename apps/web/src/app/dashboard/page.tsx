'use client';

import { MessageSquare, FileText, Clock } from 'lucide-react';
import Link from 'next/link';
import { DeadlineTimeline } from '@/components/design-system/deadline-timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

export default function DashboardPage() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: casesData } = trpc.cases.list.useQuery({ limit: 5 });

  const deadlines =
    casesData?.cases.flatMap((c) =>
      c.deadlines?.map((d) => ({
        id: d.id,
        title: d.title,
        dueDate: d.dueDate,
        urgency: d.urgency,
        status: d.status,
      })) ?? [],
    ) ?? [];

  return (
    <main className="p-8" id="main-content">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">
          Welcome{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="mt-1 text-lex-text-secondary">
          {user?.plan ?? 'FREE'} plan · Your digital law firm
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: MessageSquare, label: 'Consultations', value: casesData?.cases.length ?? 0 },
          { icon: FileText, label: 'Documents', value: '—' },
          { icon: Clock, label: 'Active deadlines', value: deadlines.length },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <stat.icon className="text-lex-accent-gold" size={24} aria-hidden />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-lex-text-muted">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {casesData?.cases.length ? (
              <ul className="space-y-3">
                {casesData.cases.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/dashboard/chat/${c.id}`}
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] p-4 transition-colors hover:border-lex-accent-gold/30"
                    >
                      <div>
                        <p className="font-medium">{c.title}</p>
                        <p className="text-xs text-lex-text-muted">{c.legalArea}</p>
                      </div>
                      <span className="text-xs text-lex-accent-gold">Open →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center">
                <p className="text-lex-text-muted">No cases yet</p>
                <Button asChild className="mt-4">
                  <Link href="/onboarding">Create your first case</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <DeadlineTimeline deadlines={deadlines} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}