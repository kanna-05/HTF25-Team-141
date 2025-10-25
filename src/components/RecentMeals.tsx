import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface Meal {
  id: string;
  dish_name: string;
  calories: number;
  image_url: string;
  created_at: string;
}

const RecentMeals = ({ userId }: { userId: string }) => {
  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {
    loadMeals();
  }, [userId]);

  const loadMeals = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", today)
      .order("created_at", { ascending: false });

    setMeals(data || []);
  };

  const deleteMeal = async (id: string) => {
    try {
      const { error } = await supabase.from("meals").delete().eq("id", id);
      if (error) throw error;
      
      setMeals(meals.filter((m) => m.id !== id));
      toast.success("Meal deleted");
    } catch (error) {
      toast.error("Failed to delete meal");
    }
  };

  if (meals.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <h3 className="text-lg font-semibold mb-4">Today's Meals</h3>
      <div className="space-y-3">
        <AnimatePresence>
          {meals.map((meal, index) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {meal.image_url && (
                      <img
                        src={meal.image_url}
                        alt={meal.dish_name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{meal.dish_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {meal.calories} kcal
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(meal.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMeal(meal.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecentMeals;