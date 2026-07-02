"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Link2,
  MousePointerClick,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchWithCsrf } from "@/hooks/useCsrf";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "users", label: "Users", icon: Users },
  { id: "links", label: "Links", icon: Link2 },
  { id: "clicks", label: "Clicks", icon: MousePointerClick },
];

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function truncate(value, max = 48) {
  if (!value) return "—";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function StatCard({ title, value, hint }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function TabButton({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
      {typeof count === "number" && (
        <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs">{count}</span>
      )}
    </button>
  );
}

function SuspiciousBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
      Suspicious
    </span>
  );
}

function isSuspiciousUser(user) {
  return !user.emailVerified && Number(user.linkCount) === 0;
}

export default function AdminPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("users");
  const [search, setSearch] = useState("");
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin");
      if (!response.ok) throw new Error("Access denied");
      setData(await response.json());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (status === "authenticated") {
      loadData();
    }
  }, [status, router]);

  const handleDeleteUser = async (user) => {
    if (
      !window.confirm(
        `Delete user ${user.email}? This removes their account and any links they created.`
      )
    ) {
      return;
    }

    const response = await fetchWithCsrf("/api/admin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.error || "Failed to delete user");
      return;
    }

    setData((prev) => ({
      ...prev,
      users: prev.users.filter((row) => row.id !== user.id),
      urls: prev.urls.filter((row) => row.userEmail !== user.email),
      stats: {
        ...prev.stats,
        users: Math.max(0, prev.stats.users - 1),
        suspiciousUsers: isSuspiciousUser(user)
          ? Math.max(0, prev.stats.suspiciousUsers - 1)
          : prev.stats.suspiciousUsers,
        zeroLinkUsers: Number(user.linkCount) === 0
          ? Math.max(0, prev.stats.zeroLinkUsers - 1)
          : prev.stats.zeroLinkUsers,
        unverifiedUsers: !user.emailVerified
          ? Math.max(0, prev.stats.unverifiedUsers - 1)
          : prev.stats.unverifiedUsers,
      },
    }));
  };

  const handleDeleteLink = async (url) => {
    if (!window.confirm(`Delete /${url.shortCode}?`)) return;

    const response = await fetchWithCsrf("/api/admin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shortCode: url.shortCode }),
    });

    if (!response.ok) {
      window.alert("Failed to delete link");
      return;
    }

    setData((prev) => ({
      ...prev,
      urls: prev.urls.filter((row) => row.id !== url.id),
      clicks: prev.clicks.filter((row) => row.shortCode !== url.shortCode),
      stats: {
        ...prev.stats,
        links: Math.max(0, prev.stats.links - 1),
        totalClicks: Math.max(0, prev.stats.totalClicks - Number(url.clicks || 0)),
      },
    }));
  };

  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    const query = search.trim().toLowerCase();

    return data.users.filter((user) => {
      if (suspiciousOnly && !isSuspiciousUser(user)) return false;
      if (!query) return true;
      return (
        user.email.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query)
      );
    });
  }, [data?.users, search, suspiciousOnly]);

  const filteredLinks = useMemo(() => {
    if (!data?.urls) return [];
    const query = search.trim().toLowerCase();
    if (!query) return data.urls;

    return data.urls.filter(
      (url) =>
        url.shortCode.toLowerCase().includes(query) ||
        url.originalUrl.toLowerCase().includes(query) ||
        (url.userEmail || "").toLowerCase().includes(query)
    );
  }, [data?.urls, search]);

  const filteredClicks = useMemo(() => {
    if (!data?.clicks) return [];
    const query = search.trim().toLowerCase();
    if (!query) return data.clicks;

    return data.clicks.filter(
      (click) =>
        click.shortCode.toLowerCase().includes(query) ||
        (click.referer || "").toLowerCase().includes(query) ||
        (click.userAgent || "").toLowerCase().includes(query) ||
        (click.ip || "").toLowerCase().includes(query)
    );
  }, [data?.clicks, search]);

  if (status === "loading") {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="error">
          <AlertTitle>Access denied</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  if (!data) {
    return <div className="container mx-auto p-4">Loading admin data...</div>;
  }

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            Inspect users, links, and clicks. Unverified accounts with zero links
            are flagged as suspicious.
          </p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {data.stats.suspiciousUsers > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Possible bot signups detected</AlertTitle>
          <AlertDescription>
            {data.stats.suspiciousUsers} user
            {data.stats.suspiciousUsers === 1 ? "" : "s"} registered but never
            verified email and created no links. Review the Users tab and delete
            spam accounts.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Users" value={data.stats.users} />
        <StatCard title="Links" value={data.stats.links} />
        <StatCard title="Total clicks" value={data.stats.totalClicks} />
        <StatCard
          title="Suspicious users"
          value={data.stats.suspiciousUsers}
          hint={`${data.stats.unverifiedUsers} unverified · ${data.stats.zeroLinkUsers} with no links`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <TabButton
            key={item.id}
            active={tab === item.id}
            onClick={() => {
              setTab(item.id);
              setSearch("");
            }}
            icon={item.icon}
            label={item.label}
            count={
              item.id === "users"
                ? data.users.length
                : item.id === "links"
                  ? data.urls.length
                  : data.clicks.length
            }
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            tab === "users"
              ? "Search users by name or email…"
              : tab === "links"
                ? "Search links by code, URL, or owner…"
                : "Search clicks by code, referer, IP, or user agent…"
          }
          className="sm:max-w-md"
        />
        {tab === "users" && (
          <Button
            type="button"
            variant={suspiciousOnly ? "default" : "outline"}
            onClick={() => setSuspiciousOnly((value) => !value)}
          >
            {suspiciousOnly ? "Showing suspicious only" : "Show suspicious only"}
          </Button>
        )}
      </div>

      {tab === "users" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Links</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No users match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          {isSuspiciousUser(user) && <SuspiciousBadge />}
                          {user.githubId && (
                            <p className="text-xs text-muted-foreground">GitHub sign-in</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.plan}</TableCell>
                      <TableCell>{user.emailVerified ? "Yes" : "No"}</TableCell>
                      <TableCell>{user.linkCount}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === "links" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short code</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No links match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLinks.map((url) => (
                    <TableRow key={url.id}>
                      <TableCell className="font-medium">/{url.shortCode}</TableCell>
                      <TableCell className="max-w-xs">
                        <a
                          href={url.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {truncate(url.originalUrl, 56)}
                        </a>
                      </TableCell>
                      <TableCell>
                        {url.isAnonymous ? (
                          <span className="text-muted-foreground">Anonymous</span>
                        ) : (
                          <div>
                            <p className="text-sm">{url.userName || "—"}</p>
                            <p className="text-xs text-muted-foreground">
                              {url.userEmail || "—"}
                            </p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{url.clicks}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(url.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteLink(url)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === "clicks" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Referer</TableHead>
                  <TableHead>User agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClicks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No clicks recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClicks.map((click) => (
                    <TableRow key={click.id}>
                      <TableCell className="font-medium">/{click.shortCode}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(click.timestamp)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{click.ip}</TableCell>
                      <TableCell className="max-w-xs text-xs text-muted-foreground">
                        {truncate(click.referer, 40)}
                      </TableCell>
                      <TableCell className="max-w-sm text-xs text-muted-foreground">
                        {truncate(click.userAgent, 72)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
