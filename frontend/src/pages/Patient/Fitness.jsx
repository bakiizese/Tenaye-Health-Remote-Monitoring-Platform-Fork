import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientLayout from "./components/PatientLayout";
import { getMyProfile } from "../../services/patientService";

function StreakCard({ streak, lastCheckIn }) {
  const isToday =
    lastCheckIn &&
    new Date(lastCheckIn).toDateString() === new Date().toDateString();

  return (
    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-orange-600 font-bold uppercase">
            Current Streak
          </p>
          <p className="text-4xl font-black text-orange-600 mt-2">{streak}</p>
          <p className="text-sm text-orange-600 mt-1">Days 🔥</p>
        </div>
        <div className="text-6xl">🔥</div>
      </div>
      <div className="mt-4 pt-4 border-t border-orange-200">
        <p className="text-xs text-orange-700">
          {isToday
            ? "✅ Great! You checked in today"
            : "Log your workout today to keep the streak alive!"}
        </p>
      </div>
    </div>
  );
}

function GoalSettingModal({ onClose, onSave, initialGoals }) {
  const [goals, setGoals] = useState(
    initialGoals || {
      currentWeight: "",
      targetWeight: "",
      heightCm: "",
      age: "",
      fitnessGoal: "weight_loss",
      workoutFrequency: "3_days",
      description: "",
    },
  );

  const handleSave = () => {
    if (goals.currentWeight && goals.targetWeight && goals.heightCm) {
      onSave(goals);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined">edit</span>
            Set Your Fitness Goals
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Current Weight (kg)
              </label>
              <input
                type="number"
                value={goals.currentWeight}
                onChange={(e) =>
                  setGoals({ ...goals, currentWeight: e.target.value })
                }
                placeholder="70"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Target Weight (kg)
              </label>
              <input
                type="number"
                value={goals.targetWeight}
                onChange={(e) =>
                  setGoals({ ...goals, targetWeight: e.target.value })
                }
                placeholder="65"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={goals.heightCm}
                onChange={(e) =>
                  setGoals({ ...goals, heightCm: e.target.value })
                }
                placeholder="175"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                value={goals.age}
                onChange={(e) => setGoals({ ...goals, age: e.target.value })}
                placeholder="28"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Primary Goal
            </label>
            <select
              value={goals.fitnessGoal}
              onChange={(e) =>
                setGoals({ ...goals, fitnessGoal: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="weight_loss">Weight Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="endurance">Endurance</option>
              <option value="strength">Strength</option>
              <option value="flexibility">Flexibility</option>
              <option value="general_fitness">General Fitness</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Workout Frequency
            </label>
            <select
              value={goals.workoutFrequency}
              onChange={(e) =>
                setGoals({ ...goals, workoutFrequency: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="2_days">2 days/week</option>
              <option value="3_days">3 days/week</option>
              <option value="4_days">4 days/week</option>
              <option value="5_days">5 days/week</option>
              <option value="6_days">6 days/week</option>
              <option value="7_days">7 days/week</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={goals.description}
              onChange={(e) =>
                setGoals({ ...goals, description: e.target.value })
              }
              placeholder="Any injuries, preferences, or special requirements?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows="3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!goals.currentWeight || !goals.targetWeight || !goals.heightCm}
              className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              Save Goals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkoutRecommendationCard({ recommendation }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
            <span className="text-2xl">{recommendation.emoji}</span>
          </div>
          <div>
            <h4 className="font-bold text-gray-800">{recommendation.name}</h4>
            <p className="text-xs text-gray-500">
              {recommendation.duration} min · {recommendation.intensity}
            </p>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="material-symbols-outlined text-sm">local_fire_department</span>
        <span>{recommendation.calories} cal</span>
      </div>
    </div>
  );
}

function ProgressModal({ onClose, onSave }) {
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (weight) {
      onSave({ weight: parseFloat(weight), notes, date: new Date() });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined">trending_up</span>
            Log Today's Progress
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter your weight"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Workout Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout go? What exercises did you do?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              rows="3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!weight}
              className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50"
            >
              Save Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthlyProgressChart({ progressHistory }) {
  if (progressHistory.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl mb-2">
            trending_up
          </span>
          <p>No progress data yet. Start logging your workouts!</p>
        </div>
      </div>
    );
  }

  const minWeight = Math.min(...progressHistory.map((p) => p.weight));
  const maxWeight = Math.max(...progressHistory.map((p) => p.weight));
  const range = maxWeight - minWeight || 10;
  const chartHeight = 200;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-1 h-64 bg-gradient-to-b from-emerald-50 to-white rounded-2xl p-6">
        {progressHistory.slice(-30).map((entry, idx) => {
          const normalizedHeight =
            ((entry.weight - minWeight) / range) * chartHeight + 20;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-blue-500 transition-all hover:shadow-lg"
                style={{ height: `${normalizedHeight}px` }}
                title={`${entry.weight}kg on ${new Date(entry.date).toLocaleDateString()}`}
              />
              <span className="text-[10px] text-gray-500 text-center">
                {new Date(entry.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
          <p className="text-xs text-emerald-600 font-bold">Current Weight</p>
          <p className="text-2xl mt-1 font-black text-emerald-700">
            {progressHistory[progressHistory.length - 1].weight}kg
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <p className="text-xs text-blue-600 font-bold">Starting Weight</p>
          <p className="text-2xl mt-1 font-black text-blue-700">
            {progressHistory[0].weight}kg
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
          <p className="text-xs text-purple-600 font-bold">Total Change</p>
          <p className="text-2xl mt-1 font-black text-purple-700">
            {(
              progressHistory[0].weight -
              progressHistory[progressHistory.length - 1].weight
            ).toFixed(1)}
            kg
          </p>
        </div>
        <div className="bg-pink-50 rounded-xl p-3 border border-pink-100">
          <p className="text-xs text-pink-600 font-bold">Entries</p>
          <p className="text-2xl mt-1 font-black text-pink-700">
            {progressHistory.length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PatientFitness() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [goals, setGoals] = useState(null);
  const [progressHistory, setProgressHistory] = useState([
    { weight: 75, date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
    { weight: 74.5, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { weight: 74.2, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    { weight: 74, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { weight: 73.8, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { weight: 73.5, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  ]);
  const [streak, setStreak] = useState(5);
  const [lastCheckIn, setLastCheckIn] = useState(
    new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await getMyProfile();
      if (result.data) {
        setProfile(result.data);
        setGoals({
          currentWeight: 75,
          targetWeight: 68,
          heightCm: 175,
          age: result.data.date_of_birth
            ? new Date().getFullYear() -
              new Date(result.data.date_of_birth).getFullYear()
            : 28,
          fitnessGoal: "weight_loss",
          workoutFrequency: "3_days",
          description: "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSaveGoals = (newGoals) => setGoals(newGoals);

  const handleSaveProgress = (progressData) => {
    setProgressHistory((prev) => [...prev, progressData]);
    setStreak((s) => s + 1);
    setLastCheckIn(new Date());
  };

  const calculateBMI = () => {
    if (goals?.currentWeight && goals?.heightCm) {
      const heightM = goals.heightCm / 100;
      return (goals.currentWeight / (heightM * heightM)).toFixed(1);
    }
    return null;
  };

  const getWorkoutRecommendations = () => {
    const all = [
      { name: "Morning Jog", emoji: "🏃", duration: 30, intensity: "Moderate", description: "3 km easy-paced running to build cardio fitness", calories: 250 },
      { name: "Strength Training", emoji: "💪", duration: 45, intensity: "High", description: "Upper body focus: Push-ups, bench press, rows", calories: 350 },
      { name: "Yoga Flow", emoji: "🧘", duration: 40, intensity: "Low", description: "Flexibility and stress relief (great for mental health)", calories: 120 },
      { name: "HIIT Cardio", emoji: "⚡", duration: 20, intensity: "Very High", description: "High-intensity intervals for maximum calorie burn", calories: 280 },
      { name: "Cycling", emoji: "🚴", duration: 50, intensity: "Moderate", description: "Outdoor cycling for endurance and leg strength", calories: 400 },
      { name: "Swimming", emoji: "🏊", duration: 45, intensity: "High", description: "Full-body low-impact workout", calories: 350 },
    ];
    if (goals?.fitnessGoal === "weight_loss") return all.filter((r) => r.calories > 200);
    if (goals?.fitnessGoal === "strength") return all.filter((r) => ["Strength Training", "HIIT Cardio"].includes(r.name));
    if (goals?.fitnessGoal === "flexibility") return all.filter((r) => r.intensity === "Low");
    return all;
  };

  if (loading) {
    return (
      <PatientLayout title="My Fitness">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#E05C8A] border-t-transparent rounded-full animate-spin" />
        </div>
      </PatientLayout>
    );
  }

  const bmi = calculateBMI();
  const bmiCategory =
    !bmi ? null
    : bmi < 18.5 ? { label: "Underweight", color: "text-blue-600" }
    : bmi < 25 ? { label: "Normal", color: "text-emerald-600" }
    : bmi < 30 ? { label: "Overweight", color: "text-amber-600" }
    : { label: "Obese", color: "text-red-600" };

  return (
    <PatientLayout title="My Fitness">
      {showGoalModal && (
        <GoalSettingModal
          onClose={() => setShowGoalModal(false)}
          onSave={handleSaveGoals}
          initialGoals={goals}
        />
      )}
      {showProgressModal && (
        <ProgressModal
          onClose={() => setShowProgressModal(false)}
          onSave={handleSaveProgress}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white"
          style={{ background: "linear-gradient(135deg,#E05C8A 0%,#F4845F 60%,#f59e0b 100%)" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 bg-white/5" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="material-symbols-outlined text-white/80"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  fitness_center
                </span>
                <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                  Workout Planner · Progress Tracker
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black">My Fitness</h2>
              <p className="text-white/70 mt-1 text-sm">
                Track workouts, hit your goals, and stay consistent
              </p>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit Goals
            </button>
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
            <p className="text-xs text-blue-600 font-bold uppercase">Primary Goal</p>
            <p className="text-lg font-black text-blue-900 mt-2 capitalize">
              {goals?.fitnessGoal?.replace(/_/g, " ") || "—"}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4">
            <p className="text-xs text-emerald-600 font-bold uppercase">Current Weight</p>
            <p className="text-lg font-black text-emerald-900 mt-2">
              {goals?.currentWeight ? `${goals.currentWeight} kg` : "—"}
            </p>
          </div>
          <div className="bg-purple-50 rounded-2xl border border-purple-200 p-4">
            <p className="text-xs text-purple-600 font-bold uppercase">Target Weight</p>
            <p className="text-lg font-black text-purple-900 mt-2">
              {goals?.targetWeight ? `${goals.targetWeight} kg` : "—"}
            </p>
          </div>
          <div className="bg-pink-50 rounded-2xl border border-pink-200 p-4">
            <p className="text-xs text-pink-600 font-bold uppercase">BMI</p>
            <p className={`text-lg font-black mt-2 ${bmiCategory?.color || "text-pink-900"}`}>
              {bmi || "—"}
              {bmiCategory && (
                <span className="text-xs font-normal ml-1">({bmiCategory.label})</span>
              )}
            </p>
          </div>
        </div>

        {/* Streak */}
        <StreakCard streak={streak} lastCheckIn={lastCheckIn} />

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowProgressModal(true)}
            className="py-4 px-6 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Log Today's Progress
          </button>
          <button
            onClick={() => navigate("/patient/mental-health")}
            className="py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">psychology</span>
            View Mental Health
          </button>
        </div>

        {/* AI Workout Recommendations (Free) */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E05C8A]">recommend</span>
            AI Workout Recommendations
            <span className="text-xs font-normal bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
              Free
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getWorkoutRecommendations().map((rec, idx) => (
              <WorkoutRecommendationCard key={idx} recommendation={rec} />
            ))}
          </div>
        </div>

        {/* Premium: AI Workout Schedule */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">schedule</span>
                Premium: AI Workout Schedule
              </h3>
              <p className="text-sm text-gray-600">
                Get a personalized weekly workout schedule aligned to your goals
              </p>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex-shrink-0">
              Premium
            </span>
          </div>

          <div className="bg-white rounded-xl p-4 mb-4 border border-purple-200">
            <p className="text-sm text-gray-600 mb-3">
              <strong>How it works:</strong> The AI analyzes your fitness goals, mental health
              mood, lab results, and preferences to create a tailored weekly workout schedule.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                "Personalized exercise plans based on your health conditions",
                "Intensity automatically adjusted based on your mental health mood",
                "Progressive overload: difficulty increases as you improve",
                "Real-time AI coach adjustments week by week",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => navigate("/patient/billing")}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:scale-105 transition-transform"
          >
            Upgrade to Premium
          </button>
        </div>

        {/* Monthly Progress Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">trending_up</span>
            Your Monthly Progress
          </h3>
          <MonthlyProgressChart progressHistory={progressHistory} />
        </div>

        {/* Tip */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-700 flex items-start gap-2">
            <span className="material-symbols-outlined text-sm mt-0.5">info</span>
            <span>
              <strong>Tip:</strong> The AI analyzes your lab results, blood type, and mental
              health mood to provide personalized recommendations. Mental health impacts recovery —
              check your mood tracker for optimised suggestions!
            </span>
          </p>
        </div>
      </div>
    </PatientLayout>
  );
}
