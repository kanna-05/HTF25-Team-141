import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Search, Calendar, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { format, startOfWeek, startOfMonth, isWithinInterval } from "date-fns";

interface Meal {
  id: string;
  dish_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string;
  created_at: string;
}

const History = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    if (user) {
      loadMeals();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [meals, searchQuery, dateFilter, sortBy]);

  const loadMeals = async () => {
    const { data } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setMeals(data || []);
  };

  const applyFilters = () => {
    let filtered = [...meals];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((meal) =>
        meal.dish_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    const now = new Date();
    if (dateFilter === "week") {
      const weekStart = startOfWeek(now);
      filtered = filtered.filter((meal) =>
        isWithinInterval(new Date(meal.created_at), { start: weekStart, end: now })
      );
    } else if (dateFilter === "month") {
      const monthStart = startOfMonth(now);
      filtered = filtered.filter((meal) =>
        isWithinInterval(new Date(meal.created_at), { start: monthStart, end: now })
      );
    }

    // Sort
    if (sortBy === "highest") {
      filtered.sort((a, b) => b.calories - a.calories);
    } else if (sortBy === "lowest") {
      filtered.sort((a, b) => a.calories - b.calories);
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    setFilteredMeals(filtered);
  };

  return (
    <div className="min-h-screen pb-24 md:pt-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-header p-8 rounded-b-3xl shadow-lg mb-8"
      >
        <h1 className="text-3xl font-bold text-white tracking-wide">📅 Meal History</h1>
        <p className="text-white/70 mt-2 tracking-wide">View all your tracked meals</p>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="bg-background/50 border-primary/20">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-background/50 border-primary/20">
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Calories</SelectItem>
                <SelectItem value="lowest">Lowest Calories</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Meals Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredMeals.map((meal, index) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card overflow-hidden hover:shadow-glow transition-all">
                {meal.image_url && (
                  <img
                    src={meal.image_url}
                    alt={meal.dish_name}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg tracking-wide">{meal.dish_name}</h3>
                    <span className="text-2xl font-bold text-primary">
                      {meal.calories} cal
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div className="text-center p-2 bg-background/50 rounded-lg">
                      <div className="font-semibold text-foreground">{meal.protein}g</div>
                      <div>Protein</div>
                    </div>
                    <div className="text-center p-2 bg-background/50 rounded-lg">
                      <div className="font-semibold text-foreground">{meal.carbs}g</div>
                      <div>Carbs</div>
                    </div>
                    <div className="text-center p-2 bg-background/50 rounded-lg">
                      <div className="font-semibold text-foreground">{meal.fat}g</div>
                      <div>Fat</div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(meal.created_at), "MMM d, yyyy • h:mm a")}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredMeals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-foreground"
          >
            <p className="text-lg">No meals found</p>
            <p className="text-sm mt-2">Try adjusting your filters or search query</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default History;
