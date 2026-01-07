// Enhanced Habit Tracker with Dark Mode
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
    await this.sleep(1500);

    this.loadData();
    this.setupEventListeners();
    this.initTheme();
    this.initParticles();
    this.setupAnimations();
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
    document.getElementById("loadingScreen").style.display = "flex";
  }

  hideLoading() {
    document.getElementById("loadingScreen").style.opacity = "0";
    setTimeout(() => {
      document.getElementById("loadingScreen").style.display = "none";
    }, 500);
  }

  initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    this.state.settings.darkMode = savedTheme === "dark";
    this.applyTheme();
  }

  applyTheme() {
    const theme = this.state.settings.darkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Update toggle icon
    const icon = document.querySelector("#themeToggle i");
    icon.className = this.state.settings.darkMode
      ? "fas fa-sun"
      : "fas fa-moon";
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

  initParticles() {
    const container = document.getElementById("particles");
    const particleCount = window.innerWidth < 480 ? 20 : 50;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";

      // Random properties
      const size = Math.random() * 4 + 1;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;

      // Apply styles
      particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${
                  this.state.settings.darkMode
                    ? "rgba(167, 139, 250, 0.3)"
                    : "rgba(139, 92, 246, 0.1)"
                };
                border-radius: 50%;
                left: ${posX}%;
                top: ${posY}%;
                animation: float ${duration}s ease-in-out ${delay}s infinite;
            `;

      container.appendChild(particle);
    }

    // Add CSS animation
    const style = document.createElement("style");
    style.textContent = `
            @keyframes float {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                25% { transform: translate(${Math.random() * 20 - 10}px, ${
      Math.random() * 20 - 10
    }px) rotate(90deg); }
                50% { transform: translate(${Math.random() * 30 - 15}px, ${
      Math.random() * 30 - 15
    }px) rotate(180deg); }
                75% { transform: translate(${Math.random() * 20 - 10}px, ${
      Math.random() * 20 - 10
    }px) rotate(270deg); }
            }
        `;
    document.head.appendChild(style);
  }

  setupAnimations() {
    // Add hover effects
    document.addEventListener("mouseover", (e) => {
      if (e.target.matches(".habit-card, .reward-card")) {
        e.target.style.transform = "translateY(-4px)";
      }
    });

    document.addEventListener("mouseout", (e) => {
      if (e.target.matches(".habit-card, .reward-card")) {
        e.target.style.transform = "translateY(0)";
      }
    });
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
        schedule: "daily",
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
        schedule: "daily",
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
        schedule: "daily",
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
        category: "entertainment",
        description: "Watch your favorite movie with snacks",
      },
      {
        id: 2,
        name: "Coffee Treat",
        cost: 50,
        category: "food",
        description: "Get a fancy coffee from your favorite café",
      },
      {
        id: 3,
        name: "Game Time",
        cost: 150,
        category: "entertainment",
        description: "1 hour of guilt-free gaming",
      },
      {
        id: 4,
        name: "Shopping Spree",
        cost: 300,
        category: "shopping",
        description: "Buy something nice for yourself",
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
      {
        id: 4,
        name: "Squats",
        reps: "25 reps",
        gemLoss: 12,
        difficulty: "medium",
        description: "Lower body workout",
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
        this.state = { ...this.state, ...data };

        // Ensure arrays exist
        this.state.habits = this.state.habits || [];
        this.state.rewards = this.state.rewards || [];
        this.state.punishments = this.state.punishments || [];
        this.state.achievements = this.state.achievements || [];
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
    document.getElementById("currentDate").textContent = now.toLocaleDateString(
      "en-US",
      options
    );
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
    document.getElementById(
      "pendingCount"
    ).textContent = `${todayHabits.length} pending`;

    // Render today's habits
    const todayList = document.getElementById("todayHabitsList");
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

    // Render achievements preview
    this.renderAchievementsPreview();

    // Update motivation text
    this.updateMotivation();
  }

  renderHabits(filterCategory = "all", filterDifficulty = "all") {
    const habitsList = document.getElementById("habitsList");
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

    availableGems.textContent = this.state.gems;

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
                        <span class="reward-category">
                            ${this.getCategoryIcon(reward.category)} ${
            reward.category
          }
                        </span>
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

  renderPunishments() {
    const pendingWorkouts = document.getElementById("pendingWorkouts");
    const punishmentsList = document.getElementById("punishmentsList");
    const pendingCount = document.getElementById("pendingWorkoutsCount");
    const completedWorkouts = document.getElementById("completedWorkouts");
    const totalGemsLost = document.getElementById("totalGemsLost");

    // Update stats
    pendingCount.textContent = `${
      this.state.pendingWorkouts.filter((w) => !w.completed).length
    } Pending`;
    completedWorkouts.textContent = this.state.stats.workoutsCompleted;
    totalGemsLost.textContent = this.state.stats.totalGemsLost;

    // Render pending workouts
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

    // Render workout library
    punishmentsList.innerHTML = this.state.punishments
      .map(
        (punishment) => `
            <div class="workout-card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4 style="margin-bottom: 4px;">${punishment.name}</h4>
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

  renderProfile() {
    // Update user info
    document.getElementById("avatarInitial").textContent =
      this.state.user.name.charAt(0);
    document.getElementById("userName").textContent = this.state.user.name;
    document.getElementById("userTitle").textContent = this.state.user.title;
    document.getElementById("profileLevel").textContent = this.state.level;

    // Update stats
    const totalHabits = this.state.habits.length;
    const completionRate =
      totalHabits > 0
        ? Math.round(
            (this.state.stats.totalCompletions /
              (this.state.stats.totalCompletions +
                this.state.stats.totalFails)) *
              100
          )
        : 0;

    document.getElementById(
      "completionRate"
    ).style.width = `${completionRate}%`;
    document.querySelector(
      "#completionRate + .stat-value"
    ).textContent = `${completionRate}%`;
    document.getElementById("totalGemsEarned").textContent =
      this.state.stats.totalGemsEarned;
    document.getElementById("totalCompletions").textContent =
      this.state.stats.totalCompletions;
    document.getElementById("totalFails").textContent =
      this.state.stats.totalFails;
    document.getElementById("currentStreakStats").textContent =
      this.state.streak;
    document.getElementById("achievementsCount").textContent =
      this.state.achievements.filter((a) => a.unlocked).length;

    // Render chart
    this.renderProgressChart();
  }

  renderProgressChart() {
    const ctx = document.getElementById("progressChart").getContext("2d");
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

    const config = {
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
    };

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, config);
  }

  renderAchievementsPreview() {
    const unlocked = this.state.achievements.filter((a) => a.unlocked);
    const achievementsList = document.getElementById("achievementsList");

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

  updateStatsBar() {
    document.getElementById("totalGems").textContent = this.state.gems;
    document.getElementById("currentStreak").textContent = this.state.streak;
    document.getElementById("todayProgress").textContent = `${
      this.state.habits.filter((h) =>
        h.completedDates.includes(this.getTodayDate())
      ).length
    }/${this.state.habits.length}`;
    document.getElementById("userLevel").textContent = this.state.level;
    document.getElementById("xpCount").textContent = this.state.xp;
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
    document.getElementById("motivationText").textContent = randomMessage;
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

  getCategoryIcon(category) {
    const icons = {
      entertainment: "🎬",
      food: "🍔",
      shopping: "🛍️",
      experience: "🎯",
      digital: "💻",
    };
    return icons[category] || "🎁";
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

    // Animation
    this.animateGemEarned(gemsEarned);
    this.showToast(`+${gemsEarned} gems earned!`, "success");

    // Celebration effect
    this.createConfetti();
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

    // Show celebration
    this.createConfetti();
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

      this.createConfetti();
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
    const title = toast.querySelector(".toast-title");
    const message = toast.querySelector(".toast-message");

    title.textContent = achievement.name;
    message.textContent = `Unlocked: ${achievement.description} (+${achievement.reward} gems)`;

    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 5000);

    this.createConfetti();
  }

  // Animations
  animateGemEarned(gems) {
    const gemDisplay = document.querySelector(".gem-display");
    const animation = document.createElement("div");
    animation.className = "gem-animation";
    animation.textContent = `+${gems}`;
    animation.style.cssText = `
            position: absolute;
            background: var(--gradient-primary);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: bold;
            z-index: 1000;
            animation: floatUp 1s ease-out forwards;
        `;

    gemDisplay.parentNode.appendChild(animation);

    setTimeout(() => animation.remove(), 1000);
  }

  createConfetti() {
    const colors = ["#8B5CF6", "#F59E0B", "#10B981", "#3B82F6", "#EF4444"];

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${
                  colors[Math.floor(Math.random() * colors.length)]
                };
                top: -20px;
                left: ${Math.random() * 100}%;
                border-radius: ${Math.random() > 0.5 ? "50%" : "0"};
                z-index: 9999;
                pointer-events: none;
                animation: confettiFall ${
                  Math.random() * 3 + 2
                }s linear forwards;
            `;

      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 5000);
    }
  }

  showToast(message, type = "success") {
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
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Event Listeners
  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-btn, .menu-item").forEach((btn) => {
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

    // Theme toggle
    document
      .getElementById("themeToggle")
      .addEventListener("click", () => this.toggleTheme());

    // Menu toggle
    document
      .getElementById("menuBtn")
      .addEventListener("click", () => this.toggleSideMenu());
    document
      .getElementById("menuCloseBtn")
      .addEventListener("click", () => this.closeSideMenu());

    // Category filter
    document.querySelectorAll(".category-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const category = e.currentTarget.dataset.category;
        document
          .querySelectorAll(".category-btn")
          .forEach((b) => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.renderHabits(category);
      });
    });

    // Difficulty filter
    document.querySelectorAll(".difficulty-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const difficulty = e.currentTarget.dataset.difficulty;
        document
          .querySelectorAll(".difficulty-btn")
          .forEach((b) => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.renderHabits("all", difficulty);
      });
    });

    // Modals
    document
      .getElementById("addHabitBtn")
      .addEventListener("click", () => this.showHabitModal());
    document
      .getElementById("addRewardBtn")
      .addEventListener("click", () => this.showRewardModal());
    document
      .getElementById("addPunishmentBtn")
      .addEventListener("click", () => this.showPunishmentModal());
    document
      .getElementById("quickAddBtn")
      .addEventListener("click", () => this.showHabitModal());

    // Form submissions
    document
      .getElementById("habitForm")
      .addEventListener("submit", (e) => this.handleAddHabit(e));
    document
      .getElementById("rewardForm")
      .addEventListener("submit", (e) => this.handleAddReward(e));
    document
      .getElementById("punishmentForm")
      .addEventListener("submit", (e) => this.handleAddPunishment(e));

    // Close modals
    document.querySelectorAll(".modal-close, .btn-outline").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const modal = e.target.closest(".modal");
        if (modal) modal.classList.remove("active");
      });
    });

    // Close modals on outside click
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("active");
      });
    });

    // Refresh motivation
    document
      .getElementById("refreshMotivation")
      .addEventListener("click", () => this.updateMotivation());

    // Add keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document
          .querySelectorAll(".modal.active")
          .forEach((modal) => modal.classList.remove("active"));
        this.closeSideMenu();
      }
    });

    // Add CSS for animations
    this.addAnimationStyles();
  }

  addAnimationStyles() {
    const styles = `
            @keyframes floatUp {
                0% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(-50px); opacity: 0; }
            }
            
            @keyframes confettiFall {
                0% { transform: translateY(0) rotate(0deg); }
                100% { transform: translateY(100vh) rotate(720deg); }
            }
            
            .gem-animation {
                animation: floatUp 1s ease-out forwards;
            }
            
            .confetti {
                animation: confettiFall 3s linear forwards;
            }
        `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
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
    document.getElementById("sideMenu").classList.toggle("active");
  }

  closeSideMenu() {
    document.getElementById("sideMenu").classList.remove("active");
  }

  showHabitModal() {
    document.getElementById("habitModal").classList.add("active");
    document.getElementById("habitName").focus();
  }

  showRewardModal() {
    document.getElementById("rewardModal").classList.add("active");
  }

  showPunishmentModal() {
    document.getElementById("punishmentModal").classList.add("active");
  }

  handleAddHabit(e) {
    e.preventDefault();

    const habit = {
      id: Date.now(),
      name: document.getElementById("habitName").value,
      category: document.getElementById("habitCategory").value.split(" ")[0],
      difficulty: document
        .getElementById("habitDifficulty")
        .value.split(" ")[0],
      importance: parseInt(document.getElementById("habitImportance").value),
      schedule: document.getElementById("habitSchedule").value,
      created: this.getTodayDate(),
      completedDates: [],
      totalCompletions: 0,
      totalFails: 0,
    };

    this.state.habits.push(habit);
    this.saveData();
    this.renderAll();
    this.hideModal("habitModal");

    this.showToast(`Habit "${habit.name}" added!`, "success");
  }

  handleAddReward(e) {
    e.preventDefault();

    const reward = {
      id: Date.now(),
      name: document.getElementById("rewardName").value,
      cost: parseInt(document.getElementById("rewardCost").value),
      category: document.getElementById("rewardCategory").value,
      description: document.getElementById("rewardDescription").value,
    };

    this.state.rewards.push(reward);
    this.saveData();
    this.renderRewards();
    this.hideModal("rewardModal");

    this.showToast(`Reward "${reward.name}" added!`, "success");
  }

  handleAddPunishment(e) {
    e.preventDefault();

    const punishment = {
      id: Date.now(),
      name: document.getElementById("punishmentName").value,
      reps: document.getElementById("punishmentReps").value,
      gemLoss: parseInt(document.getElementById("punishmentGemLoss").value),
      difficulty: document.getElementById("punishmentDifficulty").value,
      description: "",
    };

    this.state.punishments.push(punishment);
    this.saveData();
    this.renderPunishments();
    this.hideModal("punishmentModal");

    this.showToast(`Workout "${punishment.name}" added!`, "success");
  }

  hideModal(modalId) {
    document.getElementById(modalId).classList.remove("active");
  }
}

// Initialize app
let app;

document.addEventListener("DOMContentLoaded", () => {
  app = new GamifyLife();
  window.app = app;
});

// Add to homescreen prompt
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.deferredPrompt = e;

  // Show install button
  const installBtn = document.createElement("button");
  installBtn.textContent = "Install App";
  installBtn.className = "btn-primary";
  installBtn.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
    `;

  installBtn.addEventListener("click", async () => {
    if (!window.deferredPrompt) return;

    window.deferredPrompt.prompt();
    const { outcome } = await window.deferredPrompt.userChoice;

    if (outcome === "accepted") {
      installBtn.remove();
    }

    window.deferredPrompt = null;
  });

  document.body.appendChild(installBtn);
});
