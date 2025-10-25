import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/");
      } else {
        setUser(user);
        loadProfile(user.id);
        loadChartData(user.id);
      }
    });
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    setProfile(data || {});
  };

  const loadChartData = async (userId: string) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    const data = await Promise.all(
      last7Days.map(async (date) => {
        const { data: meals } = await supabase
          .from("meals")
          .select("calories")
          .eq("user_id", userId)
          .gte("created_at", date)
          .lt("created_at", new Date(new Date(date).getTime() + 86400000).toISOString());

        const total = meals?.reduce((sum, meal) => sum + meal.calories, 0) || 0;
        return {
          date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
          calories: total,
        };
      })
    );

    setChartData(data);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          weight: profile.weight,
          height: profile.height,
          daily_calorie_goal: profile.daily_calorie_goal,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Your Profile
          </h1>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name || ""}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age || ""}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                  placeholder="25"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={profile.gender || ""}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  placeholder="Male/Female/Other"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={profile.weight || ""}
                  onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) })}
                  placeholder="70"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={profile.height || ""}
                  onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) })}
                  placeholder="175"
                />
              </div>
              <div>
                <Label htmlFor="goal">Daily Calorie Goal</Label>
                <Input
                  id="goal"
                  type="number"
                  value={profile.daily_calorie_goal || 2000}
                  onChange={(e) =>
                    setProfile({ ...profile, daily_calorie_goal: parseInt(e.target.value) })
                  }
                  placeholder="2000"
                />
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full gradient-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Calorie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Calorie Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Track your daily calorie intake over the past week</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;