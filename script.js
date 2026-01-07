// Enhanced Habit Tracker with Dark Mode - FIXED VERSION
class GamifyLife {
  constructor() {
    this.state = {
      gems: 100,
      xp: 0,
      level: 1,
      streak: 0,
      habits: [],
      rewards: [],
      punishments: [],
      achievements: [],
      dailyCompletions: {},
      pendingWorkouts: [],
      stats: {
        totalCompletions: 0,
        totalFails: 0,
        totalGemsEarned: 0,
        totalGemsLost: 0,
        workoutsCompleted: 0,
      },
      user: {
        name: "Habit Warrior",
        title: "Beginner",
        joinDate: new Date().toISOString(),
      },
      settings: {
        darkMode: false,
        notifications: true,
        sound: true,
        vibration: true,
      },
    };

    this.init();
  }

  async init() {
    // Show loading screen
    this.showLoading();

    // Initialize with delay for smooth loading
    await this.sleep(1000);

    this.loadData();
    this.setupEventListeners();
    this.initTheme();
    this.renderAll();
    this.updateDate();

    // Hide loading screen
    this.hideLoading();

    this.showToast("Welcome to GamifyLife! Start your journey!", "success");

    // Load default data if empty
    if (this.state.habits.length === 0) {
      this.loadDefaultData();
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  showLoading() {
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      loadingScreen.style.display = "flex";
    }
  }

  hideLoading() {
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      loadingScreen.style.opacity = "0";
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, 500);
    }
  }

  initTheme() {
    const savedTheme = localStorage.getItem("gamifyLifeTheme") || "light";
    this.state.settings.darkMode = savedTheme === "dark";
    this.applyTheme();
  }

  applyTheme() {
    const theme = this.state.settings.darkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("gamifyLifeTheme", theme);

    // Update toggle icon
    const icon = document.querySelector("#themeToggle i");
    if (icon) {
      icon.className = this.state.settings.darkMode
        ? "fas fa-sun"
        : "fas fa-moon";
    }
  }

  toggleTheme() {
    this.state.settings.darkMode = !this.state.settings.darkMode;
    this.applyTheme();

    // Add animation effect
    document.body.style.opacity = "0.9";
    setTimeout(() => {
      document.body.style.opacity = "1";
    }, 300);
  }

  loadDefaultData() {
    // Default habits
    this.state.habits = [
      {
        id: 1,
        name: "Drink 8 glasses of water",
        category: "health",
        difficulty: "easy",
        importance: 4,
        created: this.getTodayDate(),
        completedDates: [],
        totalCompletions: 0,
        totalFails: 0,
      },
      {
        id: 2,
        name: "30-minute workout",
        category: "fitness",
        difficulty: "medium",
        importance: 5,
        created: this.getTodayDate(),
        completedDates: [],
        totalCompletions: 0,
        totalFails: 0,
      },
      {
        id: 3,
        name: "Read 20 pages",
        category: "learning",
        difficulty: "medium",
        importance: 3,
        created: this.getTodayDate(),
        completedDates: [],
        totalCompletions: 0,
        totalFails: 0,
      },
    ];

    // Default rewards
    this.state.rewards = [
      {
        id: 1,
        name: "Movie Night",
        cost: 100,
        description: "Watch your favorite movie with snacks",
      },
      {
        id: 2,
        name: "Coffee Treat",
        cost: 50,
        description: "Get a fancy coffee from your favorite café",
      },
      {
        id: 3,
        name: "Game Time",
        cost: 150,
        description: "1 hour of guilt-free gaming",
      },
    ];

    // Default punishments
    this.state.punishments = [
      {
        id: 1,
        name: "Push-ups",
        reps: "20 reps",
        gemLoss: 10,
        difficulty: "medium",
        description: "Strengthen your upper body",
      },
      {
        id: 2,
        name: "Sit-ups",
        reps: "30 reps",
        gemLoss: 8,
        difficulty: "easy",
        description: "Core strengthening exercise",
      },
      {
        id: 3,
        name: "Plank",
        reps: "1 minute",
        gemLoss: 15,
        difficulty: "hard",
        description: "Full body isometric exercise",
      },
    ];

    // Default achievements
    this.state.achievements = [
      {
        id: 1,
        name: "First Step",
        description: "Complete your first habit",
        icon: "fas fa-footsteps",
        unlocked: false,
        reward: 50,
      },
      {
        id: 2,
        name: "Consistency King",
        description: "3-day streak",
        icon: "fas fa-crown",
        unlocked: false,
        reward: 100,
      },
      {
        id: 3,
        name: "Gem Collector",
        description: "Earn 500 gems",
        icon: "fas fa-gem",
        unlocked: false,
        reward: 200,
      },
    ];

    this.saveData();
  }

  loadData() {
    const saved = localStorage.getItem("gamifyLifeData");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Merge with default state but keep arrays
        this.state = {
          ...this.state,
          ...data,
          habits: data.habits || this.state.habits,
          rewards: data.rewards || this.state.rewards,
          punishments: data.punishments || this.state.punishments,
          achievements: data.achievements || this.state.achievements,
        };
      } catch (e) {
        console.error("Error loading data:", e);
      }
    }

    this.saveData();
  }

  saveData() {
    localStorage.setItem("gamifyLifeData", JSON.stringify(this.state));
  }

  updateDate() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const dateElement = document.getElementById("currentDate");
    if (dateElement) {
      dateElement.textContent = now.toLocaleDateString("en-US", options);
    }
  }

  renderAll() {
    this.renderDashboard();
    this.renderHabits();
    this.renderRewards();
    this.renderPunishments();
    this.renderProfile();
    this.updateStatsBar();
  }

  renderDashboard() {
    const today = this.getTodayDate();
    const todayHabits = this.state.habits.filter(
      (habit) => !habit.completedDates.includes(today)
    );

    // Update stats bar
    const pendingCount = document.getElementById("pendingCount");
    if (pendingCount) {
      pendingCount.textContent = `${todayHabits.length} pending`;
    }

    // Render today's habits
    const todayList = document.getElementById("todayHabitsList");
    if (todayList) {
      if (todayHabits.length === 0) {
        todayList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-check-circle"></i>
                        <p>All habits completed for today! 🎉</p>
                    </div>
                `;
      } else {
        todayList.innerHTML = todayHabits
          .map((habit) => this.createHabitCard(habit, true))
          .join("");
      }
    }

    // Render achievements preview
    this.renderAchievementsPreview();

    // Update motivation text
    this.updateMotivation();
  }

  renderHabits(filterCategory = "all", filterDifficulty = "all") {
    const habitsList = document.getElementById("habitsList");
    if (!habitsList) return;

    let filteredHabits = this.state.habits;

    if (filterCategory !== "all") {
      filteredHabits = filteredHabits.filter(
        (habit) => habit.category === filterCategory
      );
    }

    if (filterDifficulty !== "all") {
      filteredHabits = filteredHabits.filter(
        (habit) => habit.difficulty === filterDifficulty
      );
    }

    if (filteredHabits.length === 0) {
      habitsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-plus-circle"></i>
                    <p>No habits found. Add your first habit!</p>
                </div>
            `;
    } else {
      habitsList.innerHTML = filteredHabits
        .map((habit) => this.createHabitCard(habit))
        .join("");
    }
  }

  createHabitCard(habit, compact = false) {
    const today = this.getTodayDate();
    const isCompletedToday = habit.completedDates.includes(today);
    const gemRewards = { easy: 5, medium: 10, hard: 20, extreme: 50 };
    const reward = gemRewards[habit.difficulty] * habit.importance;

    const categoryIcons = {
      health: "fas fa-heartbeat",
      fitness: "fas fa-running",
      learning: "fas fa-graduation-cap",
      productivity: "fas fa-briefcase",
      mindfulness: "fas fa-spa",
      finance: "fas fa-money-bill-wave",
      social: "fas fa-users",
      creative: "fas fa-palette",
    };

    return `
            <div class="habit-card ${isCompletedToday ? "completed" : ""}" 
                 data-id="${habit.id}">
                <div class="habit-header">
                    <div>
                        <div class="habit-title">${habit.name}</div>
                        <div class="habit-category">
                            <i class="${
                              categoryIcons[habit.category] || "fas fa-tag"
                            }"></i>
                            ${habit.category}
                        </div>
                    </div>
                    <div class="habit-reward">
                        <i class="fas fa-gem"></i>
                        ${reward}
                    </div>
                </div>
                
                <div class="habit-meta">
                    <span class="habit-difficulty ${habit.difficulty}">
                        ${
                          habit.difficulty.charAt(0).toUpperCase() +
                          habit.difficulty.slice(1)
                        }
                    </span>
                    <span class="habit-importance">
                        ${"★".repeat(habit.importance)}${"☆".repeat(
      5 - habit.importance
    )}
                    </span>
                </div>
                
                ${
                  !compact
                    ? `
                <div class="habit-stats">
                    <small>✅ ${habit.totalCompletions} • ❌ ${
                        habit.totalFails
                      }</small>
                </div>
                
                <div class="habit-actions">
                    <button class="habit-btn complete" 
                            onclick="app.completeHabit(${habit.id})"
                            ${isCompletedToday ? "disabled" : ""}>
                        <i class="fas fa-check"></i> Complete
                    </button>
                    <button class="habit-btn fail" 
                            onclick="app.failHabit(${habit.id})">
                        <i class="fas fa-times"></i> Fail
                    </button>
                </div>
                `
                    : ""
                }
            </div>
        `;
  }

  renderRewards() {
    const rewardsList = document.getElementById("rewardsList");
    const availableGems = document.getElementById("availableGems");

    if (availableGems) {
      availableGems.textContent = this.state.gems;
    }

    if (rewardsList) {
      if (this.state.rewards.length === 0) {
        rewardsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-gift"></i>
                        <p>No rewards yet. Add your first reward!</p>
                    </div>
                `;
      } else {
        rewardsList.innerHTML = this.state.rewards
          .map(
            (reward) => `
                    <div class="reward-card" data-id="${reward.id}">
                        <div class="reward-header">
                            <div class="reward-name">${reward.name}</div>
                            <div class="reward-cost">
                                <i class="fas fa-gem"></i>
                                ${reward.cost}
                            </div>
                        </div>
                        
                        <div class="reward-description">
                            ${reward.description || "No description"}
                        </div>
                        
                        <div class="reward-actions">
                            <button class="redeem-btn" 
                                    onclick="app.redeemReward(${reward.id})"
                                    ${
                                      this.state.gems < reward.cost
                                        ? "disabled"
                                        : ""
                                    }>
                                <i class="fas fa-shopping-cart"></i> Redeem
                            </button>
                        </div>
                    </div>
                `
          )
          .join("");
      }
    }
  }

  renderPunishments() {
    const pendingWorkouts = document.getElementById("pendingWorkouts");
    const punishmentsList = document.getElementById("punishmentsList");
    const pendingCount = document.getElementById("pendingWorkoutsCount");
    const completedWorkouts = document.getElementById("completedWorkouts");
    const totalGemsLost = document.getElementById("totalGemsLost");

    // Update stats
    if (pendingCount) {
      pendingCount.textContent = `${
        this.state.pendingWorkouts.filter((w) => !w.completed).length
      } Pending`;
    }
    if (completedWorkouts) {
      completedWorkouts.textContent = this.state.stats.workoutsCompleted;
    }
    if (totalGemsLost) {
      totalGemsLost.textContent = this.state.stats.totalGemsLost;
    }

    // Render pending workouts
    if (pendingWorkouts) {
      const activeWorkouts = this.state.pendingWorkouts.filter(
        (w) => !w.completed
      );
      if (activeWorkouts.length === 0) {
        pendingWorkouts.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-check-circle"></i>
                        <p>No pending workouts! Great job!</p>
                    </div>
                `;
      } else {
        pendingWorkouts.innerHTML = activeWorkouts
          .map(
            (workout) => `
                    <div class="challenge-card" data-id="${workout.id}">
                        <div>
                            <h4>${workout.name}</h4>
                            <p style="color: var(--danger-color); font-weight: 600; margin-top: 4px;">
                                <i class="fas fa-fire"></i> ${workout.reps}
                            </p>
                            <small style="color: var(--text-secondary);">
                                Gem penalty: -${workout.gemLoss}
                            </small>
                        </div>
                        <button class="btn-primary" onclick="app.completeWorkout(${workout.id})">
                            <i class="fas fa-check"></i> Complete
                        </button>
                    </div>
                `
          )
          .join("");
      }
    }

    // Render workout library
    if (punishmentsList) {
      punishmentsList.innerHTML = this.state.punishments
        .map(
          (punishment) => `
                <div class="workout-card">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h4 style="margin-bottom: 4px;">${
                              punishment.name
                            }</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem;">
                                ${punishment.description || ""}
                            </p>
                        </div>
                        <span class="badge ${punishment.difficulty}">
                            ${punishment.difficulty}
                        </span>
                    </div>
                    <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--danger-color); font-weight: 600;">
                            <i class="fas fa-gem"></i> -${punishment.gemLoss}
                        </span>
                        <span style="color: var(--text-secondary); font-size: 0.9rem;">
                            <i class="fas fa-dumbbell"></i> ${punishment.reps}
                        </span>
                    </div>
                </div>
            `
        )
        .join("");
    }
  }

  renderProfile() {
    // Update user info
    const avatarInitial = document.getElementById("avatarInitial");
    const userName = document.getElementById("userName");
    const userTitle = document.getElementById("userTitle");
    const profileLevel = document.getElementById("profileLevel");

    if (avatarInitial)
      avatarInitial.textContent = this.state.user.name.charAt(0);
    if (userName) userName.textContent = this.state.user.name;
    if (userTitle) userTitle.textContent = this.state.user.title;
    if (profileLevel) profileLevel.textContent = this.state.level;

    // Update stats
    const totalHabits = this.state.habits.length;
    const completionRate =
      totalHabits > 0
        ? Math.round(
            (this.state.stats.totalCompletions /
              (this.state.stats.totalCompletions +
                this.state.stats.totalFails)) *
              100
          ) || 0
        : 0;

    const completionRateBar = document.getElementById("completionRate");
    const completionRateText = document.querySelector(
      "#completionRate + .stat-value"
    );
    const totalGemsEarned = document.getElementById("totalGemsEarned");
    const totalCompletions = document.getElementById("totalCompletions");
    const totalFails = document.getElementById("totalFails");
    const currentStreakStats = document.getElementById("currentStreakStats");
    const achievementsCount = document.getElementById("achievementsCount");

    if (completionRateBar) completionRateBar.style.width = `${completionRate}%`;
    if (completionRateText)
      completionRateText.textContent = `${completionRate}%`;
    if (totalGemsEarned)
      totalGemsEarned.textContent = this.state.stats.totalGemsEarned;
    if (totalCompletions)
      totalCompletions.textContent = this.state.stats.totalCompletions;
    if (totalFails) totalFails.textContent = this.state.stats.totalFails;
    if (currentStreakStats) currentStreakStats.textContent = this.state.streak;
    if (achievementsCount)
      achievementsCount.textContent = this.state.achievements.filter(
        (a) => a.unlocked
      ).length;

    // Render chart if canvas exists
    this.renderProgressChart();
  }

  renderProgressChart() {
    const canvas = document.getElementById("progressChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const last7Days = this.getLast7Days();

    const data = {
      labels: last7Days.map((date) => {
        const d = new Date(date);
        return d.toLocaleDateString("en-US", { weekday: "short" });
      }),
      datasets: [
        {
          label: "Habits Completed",
          data: last7Days.map((date) => {
            return this.state.habits.reduce((count, habit) => {
              return count + (habit.completedDates.includes(date) ? 1 : 0);
            }, 0);
          }),
          backgroundColor: "rgba(139, 92, 246, 0.2)",
          borderColor: "rgba(139, 92, 246, 1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: "line",
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  renderAchievementsPreview() {
    const unlocked = this.state.achievements.filter((a) => a.unlocked);
    const achievementsList = document.getElementById("achievementsList");

    if (achievementsList) {
      if (unlocked.length === 0) {
        achievementsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-medal"></i>
                        <p>Complete habits to unlock achievements!</p>
                    </div>
                `;
      } else {
        achievementsList.innerHTML = unlocked
          .slice(-3)
          .map(
            (achievement) => `
                    <div class="achievement-badge">
                        <div class="achievement-icon">
                            <i class="${achievement.icon}"></i>
                        </div>
                        <div class="achievement-info">
                            <strong>${achievement.name}</strong>
                            <small>${achievement.description}</small>
                        </div>
                    </div>
                `
          )
          .join("");
      }
    }
  }

  updateStatsBar() {
    const totalGems = document.getElementById("totalGems");
    const currentStreak = document.getElementById("currentStreak");
    const todayProgress = document.getElementById("todayProgress");
    const userLevel = document.getElementById("userLevel");
    const xpCount = document.getElementById("xpCount");

    if (totalGems) totalGems.textContent = this.state.gems;
    if (currentStreak) currentStreak.textContent = this.state.streak;
    if (todayProgress) {
      const completedToday = this.state.habits.filter((h) =>
        h.completedDates.includes(this.getTodayDate())
      ).length;
      todayProgress.textContent = `${completedToday}/${this.state.habits.length}`;
    }
    if (userLevel) userLevel.textContent = this.state.level;
    if (xpCount) xpCount.textContent = this.state.xp;
  }

  updateMotivation() {
    const messages = [
      "The secret of getting ahead is getting started.",
      "Small steps every day lead to big results over time.",
      "Consistency is the key to mastery.",
      "Your future self will thank you for today's effort.",
      "Every habit you build is an investment in yourself.",
      "Progress, not perfection, is what matters.",
      "You're one habit away from a better life.",
      "The pain of discipline is less than the pain of regret.",
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const motivationText = document.getElementById("motivationText");
    if (motivationText) {
      motivationText.textContent = randomMessage;
    }
  }

  getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  getLast7Days() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  }

  // Habit Actions
  completeHabit(habitId) {
    const habit = this.state.habits.find((h) => h.id === habitId);
    if (!habit) return;

    const today = this.getTodayDate();

    if (habit.completedDates.includes(today)) {
      this.showToast("Habit already completed today!", "warning");
      return;
    }

    // Add completion
    habit.completedDates.push(today);
    habit.totalCompletions++;

    // Calculate reward
    const gemRewards = { easy: 5, medium: 10, hard: 20, extreme: 50 };
    let gemsEarned = gemRewards[habit.difficulty] * habit.importance;

    // Add XP
    const xpEarned =
      habit.difficulty === "easy"
        ? 10
        : habit.difficulty === "medium"
        ? 25
        : habit.difficulty === "hard"
        ? 50
        : 100;

    this.state.gems += gemsEarned;
    this.state.xp += xpEarned;
    this.state.stats.totalCompletions++;
    this.state.stats.totalGemsEarned += gemsEarned;

    // Update streak
    this.updateStreak(true);

    // Check level up
    this.checkLevelUp();

    // Check achievements
    this.checkAchievements();

    this.saveData();
    this.renderAll();

    this.showToast(`+${gemsEarned} gems earned!`, "success");
  }

  failHabit(habitId) {
    const habit = this.state.habits.find((h) => h.id === habitId);
    if (!habit) return;

    const today = this.getTodayDate();

    if (this.state.dailyCompletions[`fail_${habitId}`] === today) {
      this.showToast("Habit already marked as failed today!", "warning");
      return;
    }

    habit.totalFails++;
    this.state.dailyCompletions[`fail_${habitId}`] = today;
    this.state.stats.totalFails++;

    // Deduct gems
    const gemLoss = 10 * habit.importance;
    this.state.gems = Math.max(0, this.state.gems - gemLoss);
    this.state.stats.totalGemsLost += gemLoss;

    // Add random workout
    this.addRandomWorkout();

    // Reset streak
    this.updateStreak(false);

    this.saveData();
    this.renderAll();

    this.showToast(`Habit failed! -${gemLoss} gems. Workout added.`, "error");
  }

  addRandomWorkout() {
    if (this.state.punishments.length === 0) return;

    const randomPunishment =
      this.state.punishments[
        Math.floor(Math.random() * this.state.punishments.length)
      ];

    const workout = {
      id: Date.now(),
      ...randomPunishment,
      date: this.getTodayDate(),
      completed: false,
    };

    this.state.pendingWorkouts.push(workout);
    this.showToast(`New workout: ${workout.name} ${workout.reps}`, "warning");
  }

  completeWorkout(workoutId) {
    const index = this.state.pendingWorkouts.findIndex(
      (w) => w.id === workoutId
    );
    if (index === -1) return;

    this.state.pendingWorkouts[index].completed = true;
    this.state.stats.workoutsCompleted++;

    // Add some gems back as reward for completing workout
    const gemReward = Math.floor(
      this.state.pendingWorkouts[index].gemLoss * 0.5
    );
    this.state.gems += gemReward;

    this.saveData();
    this.renderPunishments();

    this.showToast(
      `Workout completed! +${gemReward} gems as reward!`,
      "success"
    );

    // Remove after animation
    setTimeout(() => {
      this.state.pendingWorkouts.splice(index, 1);
      this.saveData();
      this.renderPunishments();
    }, 1000);
  }

  redeemReward(rewardId) {
    const reward = this.state.rewards.find((r) => r.id === rewardId);
    if (!reward) return;

    if (this.state.gems < reward.cost) {
      this.showToast("Not enough gems!", "error");
      return;
    }

    this.state.gems -= reward.cost;
    this.saveData();
    this.renderAll();

    this.showToast(`Enjoy your reward: ${reward.name}!`, "success");
  }

  updateStreak(success) {
    const today = this.getTodayDate();
    const lastStreakDate = localStorage.getItem("lastStreakDate");

    if (success) {
      if (!lastStreakDate) {
        this.state.streak = 1;
      } else {
        const lastDate = new Date(lastStreakDate);
        const currentDate = new Date(today);
        const diffDays = Math.floor(
          (currentDate - lastDate) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          this.state.streak++;
        } else if (diffDays > 1) {
          this.state.streak = 1;
        }
      }
      localStorage.setItem("lastStreakDate", today);
    } else {
      this.state.streak = 0;
    }
  }

  checkLevelUp() {
    const oldLevel = this.state.level;
    this.state.level = Math.floor(Math.sqrt(this.state.xp / 100)) + 1;

    if (this.state.level > oldLevel) {
      const levelUpGems = oldLevel * 100;
      this.state.gems += levelUpGems;

      this.showToast(
        `Level Up! You're now level ${this.state.level}! +${levelUpGems} gems`,
        "success"
      );

      // Update user title based on level
      const titles = [
        "Beginner",
        "Apprentice",
        "Warrior",
        "Champion",
        "Master",
        "Legend",
      ];
      this.state.user.title =
        titles[Math.min(this.state.level - 1, titles.length - 1)];
    }
  }

  checkAchievements() {
    this.state.achievements.forEach((achievement) => {
      if (!achievement.unlocked) {
        let shouldUnlock = false;

        switch (achievement.id) {
          case 1: // First Step
            shouldUnlock = this.state.stats.totalCompletions >= 1;
            break;
          case 2: // Consistency King
            shouldUnlock = this.state.streak >= 3;
            break;
          case 3: // Gem Collector
            shouldUnlock = this.state.stats.totalGemsEarned >= 500;
            break;
        }

        if (shouldUnlock) {
          achievement.unlocked = true;
          this.state.gems += achievement.reward;
          this.showAchievement(achievement);
        }
      }
    });
  }

  showAchievement(achievement) {
    const toast = document.getElementById("achievementToast");
    if (!toast) return;

    const title = toast.querySelector(".toast-title");
    const message = toast.querySelector(".toast-message");

    if (title) title.textContent = achievement.name;
    if (message)
      message.textContent = `Unlocked: ${achievement.description} (+${achievement.reward} gems)`;

    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 5000);
  }

  showToast(message, type = "success") {
    // Create toast element
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${
                  type === "success"
                    ? "check-circle"
                    : type === "error"
                    ? "exclamation-circle"
                    : type === "warning"
                    ? "exclamation-triangle"
                    : "info-circle"
                }"></i>
            </div>
            <div class="toast-content">
                <p class="toast-message">${message}</p>
            </div>
        `;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add("show"), 10);

    // Remove after delay
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // Event Listeners - FIXED WITH NULL CHECKS
  setupEventListeners() {
    // Navigation - Check if elements exist
    const navButtons = document.querySelectorAll(
      ".nav-btn, .menu-item[data-view]"
    );
    if (navButtons.length > 0) {
      navButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const view = e.currentTarget.dataset.view;
          if (view) this.switchView(view);

          // Update active state for nav buttons
          if (e.currentTarget.classList.contains("nav-btn")) {
            document
              .querySelectorAll(".nav-btn")
              .forEach((b) => b.classList.remove("active"));
            e.currentTarget.classList.add("active");
          }

          // Close side menu
          this.closeSideMenu();
        });
      });
    }

    // Theme toggle - Check if exists
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => this.toggleTheme());
    }

    // Menu toggle - Check if exists
    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn) {
      menuBtn.addEventListener("click", () => this.toggleSideMenu());
    }

    const menuCloseBtn = document.getElementById("menuCloseBtn");
    if (menuCloseBtn) {
      menuCloseBtn.addEventListener("click", () => this.closeSideMenu());
    }

    // Category filter - Check if exists
    const categoryBtns = document.querySelectorAll(".category-btn");
    if (categoryBtns.length > 0) {
      categoryBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const category = e.currentTarget.dataset.category;
          document
            .querySelectorAll(".category-btn")
            .forEach((b) => b.classList.remove("active"));
          e.currentTarget.classList.add("active");
          this.renderHabits(category);
        });
      });
    }

    // Difficulty filter - Check if exists
    const difficultyBtns = document.querySelectorAll(".difficulty-btn");
    if (difficultyBtns.length > 0) {
      difficultyBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const difficulty = e.currentTarget.dataset.difficulty;
          document
            .querySelectorAll(".difficulty-btn")
            .forEach((b) => b.classList.remove("active"));
          e.currentTarget.classList.add("active");
          this.renderHabits("all", difficulty);
        });
      });
    }

    // Add buttons - Check if exists
    const addHabitBtn = document.getElementById("addHabitBtn");
    if (addHabitBtn) {
      addHabitBtn.addEventListener("click", () => this.showHabitModal());
    }

    const addRewardBtn = document.getElementById("addRewardBtn");
    if (addRewardBtn) {
      addRewardBtn.addEventListener("click", () => this.showRewardModal());
    }

    const addPunishmentBtn = document.getElementById("addPunishmentBtn");
    if (addPunishmentBtn) {
      addPunishmentBtn.addEventListener("click", () =>
        this.showPunishmentModal()
      );
    }

    const quickAddBtn = document.getElementById("quickAddBtn");
    if (quickAddBtn) {
      quickAddBtn.addEventListener("click", () => this.showHabitModal());
    }

    // Form submissions - Check if forms exist
    const habitForm = document.getElementById("habitForm");
    if (habitForm) {
      habitForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddHabit(e);
      });
    }

    const rewardForm = document.getElementById("rewardForm");
    if (rewardForm) {
      rewardForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddReward(e);
      });
    }

    const punishmentForm = document.getElementById("punishmentForm");
    if (punishmentForm) {
      punishmentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddPunishment(e);
      });
    }

    // Close modals - Check if elements exist
    const closeButtons = document.querySelectorAll(
      '.modal-close, .btn-outline[id*="cancel"]'
    );
    if (closeButtons.length > 0) {
      closeButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const modal = e.target.closest(".modal");
          if (modal) modal.classList.remove("active");
        });
      });
    }

    // Close modals on outside click - Check if modals exist
    const modals = document.querySelectorAll(".modal");
    if (modals.length > 0) {
      modals.forEach((modal) => {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) modal.classList.remove("active");
        });
      });
    }

    // Refresh motivation - Check if exists
    const refreshBtn = document.getElementById("refreshMotivation");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.updateMotivation());
    }

    // Importance stars - Check if exists
    const importanceStars = document.querySelectorAll("#importanceStars .star");
    if (importanceStars.length > 0) {
      importanceStars.forEach((star) => {
        star.addEventListener("click", () => {
          const value = star.dataset.value;
          document.getElementById("habitImportance").value = value;

          // Update star display
          importanceStars.forEach((s, index) => {
            if (index < value) {
              s.textContent = "★";
              s.style.color = "#F59E0B";
            } else {
              s.textContent = "☆";
              s.style.color = "";
            }
          });
        });
      });
    }

    // Reward cost range - Check if exists
    const rewardCostRange = document.getElementById("rewardCostRange");
    const rewardCostDisplay = document.getElementById("rewardCostDisplay");
    const rewardCost = document.getElementById("rewardCost");

    if (rewardCostRange && rewardCostDisplay && rewardCost) {
      rewardCostRange.addEventListener("input", (e) => {
        const value = e.target.value;
        rewardCostDisplay.textContent = value;
        rewardCost.value = value;
      });
    }

    // Add keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document
          .querySelectorAll(".modal.active")
          .forEach((modal) => modal.classList.remove("active"));
        this.closeSideMenu();
      }
    });

    // Add animation styles
    this.addAnimationStyles();
  }

  addAnimationStyles() {
    // Only add if not already added
    if (!document.querySelector("#animation-styles")) {
      const styles = `
                @keyframes floatUp {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(-50px); opacity: 0; }
                }
                
                @keyframes confettiFall {
                    0% { transform: translateY(-100px) rotate(0deg); }
                    100% { transform: translateY(100vh) rotate(720deg); }
                }
                
                .gem-animation {
                    animation: floatUp 1s ease-out forwards;
                }
                
                .confetti {
                    animation: confettiFall 3s linear forwards;
                }
                
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--gradient-primary);
                    color: white;
                    padding: 16px 24px;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-xl);
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    z-index: 1100;
                    transform: translateX(150%);
                    transition: transform var(--transition);
                }
                
                .toast.show {
                    transform: translateX(0);
                }
                
                .toast.error {
                    background: var(--gradient-danger);
                }
                
                .toast.warning {
                    background: var(--gradient-secondary);
                }
                
                .toast.success {
                    background: var(--gradient-success);
                }
                
                .toast-icon {
                    font-size: 1.5rem;
                }
                
                .toast-content {
                    flex: 1;
                }
                
                .toast-title {
                    font-weight: 700;
                    margin-bottom: 4px;
                }
                
                .toast-message {
                    font-size: 0.9rem;
                    opacity: 0.9;
                }
            `;

      const styleSheet = document.createElement("style");
      styleSheet.id = "animation-styles";
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }
  }

  switchView(viewName) {
    document.querySelectorAll(".view").forEach((view) => {
      view.classList.remove("active");
    });

    const targetView = document.getElementById(viewName);
    if (targetView) {
      targetView.classList.add("active");

      // Scroll to top
      targetView.scrollTop = 0;
    }
  }

  toggleSideMenu() {
    const sideMenu = document.getElementById("sideMenu");
    if (sideMenu) {
      sideMenu.classList.toggle("active");
    }
  }

  closeSideMenu() {
    const sideMenu = document.getElementById("sideMenu");
    if (sideMenu) {
      sideMenu.classList.remove("active");
    }
  }

  showHabitModal() {
    const modal = document.getElementById("habitModal");
    if (modal) {
      modal.classList.add("active");
      const habitName = document.getElementById("habitName");
      if (habitName) habitName.focus();

      // Reset form
      const habitForm = document.getElementById("habitForm");
      if (habitForm) habitForm.reset();

      // Set default importance
      const importanceStars = document.querySelectorAll(
        "#importanceStars .star"
      );
      if (importanceStars.length > 0) {
        importanceStars.forEach((star, index) => {
          if (index < 3) {
            star.textContent = "★";
            star.style.color = "#F59E0B";
          } else {
            star.textContent = "☆";
            star.style.color = "";
          }
        });
      }
      const habitImportance = document.getElementById("habitImportance");
      if (habitImportance) habitImportance.value = 3;
    }
  }

  showRewardModal() {
    const modal = document.getElementById("rewardModal");
    if (modal) {
      modal.classList.add("active");

      // Reset form
      const rewardForm = document.getElementById("rewardForm");
      if (rewardForm) rewardForm.reset();

      // Reset cost display
      const rewardCostDisplay = document.getElementById("rewardCostDisplay");
      const rewardCost = document.getElementById("rewardCost");
      const rewardCostRange = document.getElementById("rewardCostRange");

      if (rewardCostDisplay) rewardCostDisplay.textContent = "50";
      if (rewardCost) rewardCost.value = 50;
      if (rewardCostRange) rewardCostRange.value = 50;
    }
  }

  showPunishmentModal() {
    const modal = document.getElementById("punishmentModal");
    if (modal) {
      modal.classList.add("active");

      // Reset form
      const punishmentForm = document.getElementById("punishmentForm");
      if (punishmentForm) punishmentForm.reset();
    }
  }

  handleAddHabit(e) {
    e.preventDefault();

    // Check if form elements exist
    const habitName = document.getElementById("habitName");
    const habitCategory = document.getElementById("habitCategory");
    const habitDifficulty = document.getElementById("habitDifficulty");
    const habitImportance = document.getElementById("habitImportance");

    if (!habitName || !habitCategory || !habitDifficulty || !habitImportance) {
      console.error("Form elements not found!");
      return;
    }

    const habit = {
      id: Date.now(),
      name: habitName.value,
      category: habitCategory.value,
      difficulty: habitDifficulty.value,
      importance: parseInt(habitImportance.value) || 3,
      created: this.getTodayDate(),
      completedDates: [],
      totalCompletions: 0,
      totalFails: 0,
    };

    this.state.habits.push(habit);
    this.saveData();
    this.renderAll();
    this.hideModal("habitModal");

    this.showToast(`Added habit: "${habit.name}"`, "success");
  }

  handleAddReward(e) {
    e.preventDefault();

    const rewardName = document.getElementById("rewardName");
    const rewardCost = document.getElementById("rewardCost");
    const rewardDescription = document.getElementById("rewardDescription");

    if (!rewardName || !rewardCost) {
      console.error("Reward form elements not found!");
      return;
    }

    const reward = {
      id: Date.now(),
      name: rewardName.value,
      cost: parseInt(rewardCost.value) || 50,
      description: rewardDescription?.value || "",
    };

    this.state.rewards.push(reward);
    this.saveData();
    this.renderRewards();
    this.hideModal("rewardModal");

    this.showToast(`Added reward: "${reward.name}"`, "success");
  }

  handleAddPunishment(e) {
    e.preventDefault();

    const punishmentName = document.getElementById("punishmentName");
    const punishmentReps = document.getElementById("punishmentReps");
    const punishmentGemLoss = document.getElementById("punishmentGemLoss");
    const punishmentDifficulty = document.getElementById(
      "punishmentDifficulty"
    );

    if (!punishmentName || !punishmentReps || !punishmentGemLoss) {
      console.error("Punishment form elements not found!");
      return;
    }

    const punishment = {
      id: Date.now(),
      name: punishmentName.value,
      reps: punishmentReps.value,
      gemLoss: parseInt(punishmentGemLoss.value) || 10,
      difficulty: punishmentDifficulty?.value || "medium",
    };

    this.state.punishments.push(punishment);
    this.saveData();
    this.renderPunishments();
    this.hideModal("punishmentModal");

    this.showToast(`Added workout: "${punishment.name}"`, "success");
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
    }
  }
}

// Initialize app with error handling
let app;

document.addEventListener("DOMContentLoaded", () => {
  try {
    app = new GamifyLife();
    window.app = app;
    console.log("GamifyLife initialized successfully!");
  } catch (error) {
    console.error("Error initializing app:", error);
    // Show user-friendly error message
    const errorMsg = document.createElement("div");
    errorMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            text-align: center;
            z-index: 9999;
            max-width: 300px;
            border: 2px solid #EF4444;
        `;
    errorMsg.innerHTML = `
            <h3 style="color: #EF4444; margin-bottom: 10px;">Error Loading App</h3>
            <p style="color: #666; margin-bottom: 20px;">There was an error initializing the application. Please refresh the page.</p>
            <button onclick="location.reload()" style="
                background: linear-gradient(135deg, #8B5CF6, #6366F1);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.05)'" 
            onmouseout="this.style.transform='scale(1)'">
                Refresh Page
            </button>
        `;
    document.body.appendChild(errorMsg);
  }
});
