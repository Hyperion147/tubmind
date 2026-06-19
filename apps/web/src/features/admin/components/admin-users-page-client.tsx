import { AlertCircle, Shield, ShieldAlert, UserRound } from "lucide-react";

import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminUserModerationPanel } from "@/features/admin/components/admin-user-moderation-panel";
import type { UserRole, UserStatus } from "@tubmind/contracts/moderation";

type UserRow = {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  blockedReason: string | null;
  lastLoginLabel: string;
  createdAtLabel: string;
  ideaCount: number;
  commentCount: number;
  isSelf: boolean;
};

type UserLog = {
  id: string;
  action: string;
  note: string | null;
  createdAtLabel: string;
  label: string;
};

type Props = {
  initialUsers: UserRow[];
  initialLogs: UserLog[];
  initialStats: {
    totalUsers: number;
    blockedUsers: number;
    reviewUsers: number;
    adminUsers: number;
  };
  filters: {
    userQuery: string;
    roleFilter: "all" | UserRole;
    userStatusFilter: "all" | UserStatus;
  };
};

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

export function AdminUsersPageClient({
  initialUsers,
  initialLogs,
  initialStats,
  filters,
}: Props) {
  const users = initialUsers;
  const logs = initialLogs;
  const stats = initialStats;

  return (
    <div className="grid gap-4">
      <SiteBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin", href: "/admin" },
          { label: "Users" },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_0.34fr]">
        <Card className="border border-border bg-card/90 shadow-sm">
          <CardHeader className="p-5 md:p-6">
            <Badge variant="outline" className="w-fit px-2.5 py-0.5 font-mono">
              User Administration
            </Badge>
            <div className="max-w-4xl space-y-2">
              <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
                Moderate accounts without dragging comments along.
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-7 md:text-base">
                This panel is now focused on accounts only, so role and status actions stay faster to load and easier to scan.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 pt-0 md:grid-cols-4 md:p-6 md:pt-0">
            <AdminStat label="Total users" value={stats.totalUsers} />
            <AdminStat label="Blocked" value={stats.blockedUsers} />
            <AdminStat label="Reviewing" value={stats.reviewUsers} />
            <AdminStat label="Admins" value={stats.adminUsers} />
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/92 shadow-sm">
          <CardHeader className="gap-3 p-5 md:p-6">
            <div className="flex size-10 items-center justify-center border border-border bg-background/70 text-foreground">
              <Shield className="size-4" />
            </div>
            <CardTitle className="text-xl">Account filters</CardTitle>
            <CardDescription className="text-sm leading-6">
              Narrow the queue by display name, email, role, or current review state.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0 md:px-6 md:pb-6">
            <form action="/admin/users" className="grid gap-3">
              <Input
                name="userQ"
                defaultValue={filters.userQuery}
                placeholder="Search display name or email..."
                className="h-11 bg-card/80"
              />
              <Button
                type="submit"
                name="role"
                value={filters.roleFilter === "admin" ? "all" : "admin"}
                variant={filters.roleFilter === "admin" ? "default" : "outline"}
                className="justify-between"
              >
                Admins
                <Shield className="size-4" />
              </Button>
              <Button
                type="submit"
                name="userStatus"
                value={filters.userStatusFilter === "blocked" ? "all" : "blocked"}
                variant={filters.userStatusFilter === "blocked" ? "default" : "outline"}
                className="justify-between"
              >
                Blocked
                <ShieldAlert className="size-4" />
              </Button>
              <Button
                type="submit"
                name="userStatus"
                value={filters.userStatusFilter === "under_review" ? "all" : "under_review"}
                variant={filters.userStatusFilter === "under_review" ? "default" : "outline"}
                className="justify-between"
              >
                Review
                <AlertCircle className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.34fr]">
        <Card className="border border-border bg-card/92 shadow-sm">
          <CardHeader className="flex-row items-start justify-between gap-4 p-5 md:p-6">
            <div>
              <Badge variant="outline" className="mb-3 px-2.5 py-0.5 font-mono">
                Accounts Queue
              </Badge>
              <CardTitle className="text-2xl">Users</CardTitle>
              <CardDescription className="mt-2 text-sm leading-6">
                Review role, account state, and participation before applying any access change.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="px-2.5 py-1.5 font-mono">
              {users.length} shown
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 pb-5 pt-0 md:px-6 md:pb-6">
            {users.length === 0 ? (
              <div className="bg-background/55 p-6 text-sm text-muted-foreground ring-1 ring-border/35">
                No users matched the current admin filters.
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="grid gap-4 border border-border bg-background/72 p-4 xl:grid-cols-[1fr_320px]"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {user.role}
                      </Badge>
                      <Badge variant="secondary" className="font-mono">
                        {humanize(user.status)}
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        {user.ideaCount} ideas
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        {user.commentCount} comments
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-semibold text-foreground">{user.displayName}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">{user.email}</p>
                      {user.blockedReason ? (
                        <p className="text-sm leading-6 text-muted-foreground">
                          Block reason: {user.blockedReason}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <UserRound className="size-4" />
                        Joined {user.createdAtLabel}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                        Last login {user.lastLoginLabel}
                      </span>
                    </div>
                  </div>

                  <AdminUserModerationPanel
                    userId={user.id}
                    currentRole={user.role}
                    currentStatus={user.status}
                    blockedReason={user.blockedReason}
                    isSelf={user.isSelf}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/88 shadow-sm">
          <CardHeader className="gap-3 p-5 md:p-6">
            <CardTitle className="text-xl">Recent user actions</CardTitle>
            <CardDescription className="text-sm leading-6">
              Block and unblock actions land here immediately while the account rows update in place.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 px-5 pb-5 pt-0 md:px-6 md:pb-6">
            {logs.length === 0 ? (
              <div className="bg-background/55 p-4 text-sm text-muted-foreground ring-1 ring-border/35">
                No moderation actions logged yet.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-background/55 p-4 ring-1 ring-border/35">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {humanize(log.action)}
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">{log.label}</p>
                  {log.note ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{log.note}</p>
                  ) : null}
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {log.createdAtLabel}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function AdminStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-background/70 p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
