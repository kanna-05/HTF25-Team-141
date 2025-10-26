import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, User, Flame, Award } from "lucide-react";
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
  Area,
  AreaChart,
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
        <div className="text-lg tracking-wide">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pt-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-header p-8 rounded-b-3xl shadow-lg mb-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-white tracking-wide">
              Your Profile
            </h1>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4 glass-card rounded-3xl p-8 shadow-glass"
        >
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-white shadow-glow">
            <User className="w-12 h-12" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-wide">
              {profile.name || "User"}
            </h2>
            <p className="text-muted-foreground text-sm tracking-wide">
              {user?.email}
            </p>
          </div>
        </motion.div>

        {/* Streak Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-4"
        >
          <Card className="glass-card shadow-glass border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-full">
                  <Flame className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground tracking-wide">Current Streak</p>
                  <p className="text-3xl font-bold tracking-wide">{profile?.streak_count || 0} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-glass border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground tracking-wide">Longest Streak</p>
                  <p className="text-3xl font-bold tracking-wide">{profile?.longest_streak || 0} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card shadow-glass border-0">
            <CardHeader>
              <CardTitle className="tracking-wide">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="tracking-wide">Name</Label>
                  <Input
                    id="name"
                    value={profile.name || ""}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Your name"
                    className="glass-card"
                  />
                </div>
                <div>
                  <Label htmlFor="age" className="tracking-wide">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age || ""}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                    placeholder="25"
                    className="glass-card"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="tracking-wide">Gender</Label>
                  <Input
                    id="gender"
                    value={profile.gender || ""}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    placeholder="Male/Female/Other"
                    className="glass-card"
                  />
                </div>
                <div>
                  <Label htmlFor="weight" className="tracking-wide">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={profile.weight || ""}
                    onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) })}
                    placeholder="70"
                    className="glass-card"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="tracking-wide">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={profile.height || ""}
                    onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) })}
                    placeholder="175"
                    className="glass-card"
                  />
                </div>
                <div>
                  <Label htmlFor="goal" className="tracking-wide">Daily Calorie Goal</Label>
                  <Input
                    id="goal"
                    type="number"
                    value={profile.daily_calorie_goal || 2000}
                    onChange={(e) =>
                      setProfile({ ...profile, daily_calorie_goal: parseInt(e.target.value) })
                    }
                    placeholder="2000"
                    className="glass-card"
                  />
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full gradient-primary text-white shadow-glow rounded-full py-6 text-base font-medium tracking-wide"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Calorie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card shadow-glass border-0">
            <CardHeader>
              <CardTitle className="tracking-wide">📈 7-Day Calorie Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card) / 0.8)",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      backdropFilter: "blur(12px)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="calories"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fill="url(#colorCalories)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center text-sm text-muted-foreground tracking-wide">
                <p>Track your daily calorie intake over the past week</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
