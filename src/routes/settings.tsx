import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — BrightSmile" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [name, setName] = useState("Dr. Adams");
  const [email] = useState("dr.adams@brightsmile.com");
  const [image, setImage] = useState<string | undefined>();
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

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
              <AvatarImage src={image} alt={name} />
              <AvatarFallback className="text-lg">
                {name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={onPickImage}
              />
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                Change picture
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                JPG or PNG. Max 2MB.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled />
            </div>
          </div>

          <Button
            onClick={() => toast.success("Profile saved")}
          >
            Save changes
          </Button>
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
              <Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
            </div>
            <div>
              <Label>New password</Label>
              <Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            </div>
            <div>
              <Label>Confirm password</Label>
              <Input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            </div>
          </div>
          <Button
            onClick={() => {
              if (!pw.current || !pw.next) return toast.error("Fill all fields");
              if (pw.next !== pw.confirm) return toast.error("Passwords do not match");
              setPw({ current: "", next: "", confirm: "" });
              toast.success("Password updated");
            }}
          >
            Update password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
