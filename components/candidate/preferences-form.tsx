"use client"
import { useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"

export function PreferencesForm() {
  const [accent, setAccent] = useState("us")
  const [locale, setLocale] = useState("en-US")
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function save() {
    setError(null)
    setSaved(false)
    setLoading(true)
    try {
      await apiFetch("/api/candidate/preferences", {
        method: "POST",
        body: { accent, locale },
      })
      setSaved(true)
    } catch (err: any) {
      setError(err?.message || "Failed to save preferences")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Preferences</CardTitle>
        <CardDescription>Choose your accent and locale</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 max-w-md">
        <div className="grid gap-2">
          <Label>Accent</Label>
          <Select value={accent} onValueChange={setAccent}>
            <SelectTrigger>
              <SelectValue placeholder="Select accent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">English (US)</SelectItem>
              <SelectItem value="uk">English (UK)</SelectItem>
              <SelectItem value="in">English (India)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Locale</Label>
          <Select value={locale} onValueChange={setLocale}>
            <SelectTrigger>
              <SelectValue placeholder="Select locale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">en-US</SelectItem>
              <SelectItem value="en-GB">en-GB</SelectItem>
              <SelectItem value="en-IN">en-IN</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {saved ? <p className="text-sm text-emerald-600">Preferences saved</p> : null}
        <Button onClick={save} disabled={loading}>
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  )
}
