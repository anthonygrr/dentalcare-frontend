import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getMe, updatePassword } from "@/api/auth.api";
import { useAuth } from "@/contexts/auth";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — DentalCare" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user", "me"],
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
  });

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayName = profile?.fullName ?? user?.fullName ?? "User";
  const displayEmail = profile?.email ?? user?.email ?? "";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your admin profile.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{displayName}</p>
              <p className="text-sm text-muted-foreground">{displayEmail}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Roles: {profile?.roles?.join(", ") ?? user?.roles?.join(", ") ?? "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Current password</Label>
              <Input
                type="password"
                value={pw.current}
                onChange={(e) => setPw({ ...pw, current: e.target.value })}
              />
            </div>
            <div>
              <Label>New password</Label>
              <Input
                type="password"
                value={pw.next}
                onChange={(e) => setPw({ ...pw, next: e.target.value })}
              />
            </div>
            <div>
              <Label>Confirm password</Label>
              <Input
                type="password"
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              />
            </div>
          </div>
          <Button
            disabled={pwLoading}
            onClick={async () => {
              if (!pw.current || !pw.next) return toast.error("Fill all fields");
              if (pw.next !== pw.confirm) return toast.error("Passwords do not match");
              setPwLoading(true);
              try {
                await updatePassword(pw.current, pw.next);
                setPw({ current: "", next: "", confirm: "" });
                toast.success("Password updated");
              } catch {
                toast.error("Failed to update password");
              } finally {
                setPwLoading(false);
              }
            }}
          >
            {pwLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Update password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
