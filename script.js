// App State
class HabitTracker {
    constructor() {
        this.state = {
            gems: 0,
            level: 1,
            streak: 0,
            habits: [],
            rewards: [],
            punishments: [],
            dailyCompletions: {},
            pendingWorkouts: [],
            settings: {
                gemMultiplier: 1,
                workoutMultiplier: 1
            }
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderAll();
        this.checkDailyReset();
        this.showNotification('Welcome to GamifyLife! Start building habits!', 'success');
    }

    // Data Persistence
    loadData() {
        const saved = localStorage.getItem('gamifyLifeData');
        if (saved) {
            const data = JSON.parse(saved);
            // Merge with default state
            this.state = { ...this.state, ...data };
        }
        
        // Initialize default rewards if none exist
        if (this.state.rewards.length === 0) {
            this.state.rewards = [
                { id: 1, name: "Watch a Movie", cost: 100, description: "Enjoy your favorite movie" },
                { id: 2, name: "Buy a Treat", cost: 50, description: "Get your favorite snack" },
                { id: 3, name: "Game Time", cost: 150, description: "1 hour of gaming" }
            ];
        }
        
        // Initialize default punishments if none exist
        if (this.state.punishments.length === 0) {
            this.state.punishments = [
                { id: 1, name: "Push-ups", reps: "20 reps", gemLoss: 10, difficulty: "medium" },
                { id: 2, name: "Sit-ups", reps: "30 reps", gemLoss: 8, difficulty: "easy" },
                { id: 3, name: "Plank", reps: "1 minute", gemLoss: 15, difficulty: "hard" }
            ];
        }
        
        this.saveData();
    }

    saveData() {
        localStorage.setItem('gamifyLifeData', JSON.stringify(this.state));
    }

    // Daily Reset Check
    checkDailyReset() {
        const today = this.getTodayDate();
        const lastReset = localStorage.getItem('lastResetDate');
        
        if (lastReset !== today) {
            // Reset daily completions
            this.state.dailyCompletions = {};
            localStorage.setItem('lastResetDate', today);
            this.saveData();
            this.showNotification('New day! Time to build new habits!', 'info');
        }
    }

    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }

    // Habit Management
    addHabit(habit) {
        const newHabit = {
            id: Date.now(),
            ...habit,
            created: this.getTodayDate(),
            completedDates: [],
            totalCompletions: 0,
            totalFails: 0
        };
        this.state.habits.push(newHabit);
        this.saveData();
        this.renderAll();
        this.showNotification(`Added habit: ${habit.name}`, 'success');
    }

    completeHabit(habitId) {
        const habit = this.state.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = this.getTodayDate();
        
        // Check if already completed today
        if (habit.completedDates.includes(today)) {
            this.showNotification('Habit already completed today!', 'warning');
            return;
        }

        // Add to completed dates
        habit.completedDates.push(today);
        habit.totalCompletions++;
        
        // Calculate gem reward
        const gemRewards = {
            easy: 5,
            medium: 10,
            hard: 20
        };
        
        let gemsEarned = gemRewards[habit.difficulty] || 5;
        gemsEarned *= habit.importance; // Multiply by importance (1-5)
        gemsEarned = Math.round(gemsEarned * this.state.settings.gemMultiplier);
        
        // Add gems
        this.state.gems += gemsEarned;
        
        // Update streak
        this.updateStreak(true);
        
        // Update level
        this.checkLevelUp();
        
        this.saveData();
        this.renderAll();
        
        this.showNotification(
            `Completed! +${gemsEarned} gems earned! Total: ${this.state.gems}`, 
            'success'
        );
    }

    failHabit(habitId) {
        const habit = this.state.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = this.getTodayDate();
        
        // Check if already failed today
        if (this.state.dailyCompletions[`fail_${habitId}`] === today) {
            this.showNotification('Habit already marked as failed today!', 'warning');
            return;
        }

        habit.totalFails++;
        this.state.dailyCompletions[`fail_${habitId}`] = today;
        
        // Deduct gems
        const gemLoss = Math.round(10 * this.state.settings.gemMultiplier);
        this.state.gems = Math.max(0, this.state.gems - gemLoss);
        
        // Add random workout punishment
        this.addRandomWorkout();
        
        // Reset streak
        this.updateStreak(false);
        
        this.saveData();
        this.renderAll();
        
        this.showNotification(
            `Habit failed! -${gemLoss} gems. Workout punishment added.`, 
            'error'
        );
    }

    // Workout Punishments
    addRandomWorkout() {
        if (this.state.punishments.length === 0) return;
        
        const randomPunishment = 
            this.state.punishments[Math.floor(Math.random() * this.state.punishments.length)];
        
        const workout = {
            id: Date.now(),
            ...randomPunishment,
            date: this.getTodayDate(),
            completed: false
        };
        
        this.state.pendingWorkouts.push(workout);
        this.showNotification(`New workout punishment: ${workout.name} ${workout.reps}`, 'warning');
    }

    completeWorkout(workoutId) {
        const index = this.state.pendingWorkouts.findIndex(w => w.id === workoutId);
        if (index !== -1) {
            this.state.pendingWorkouts[index].completed = true;
            
            // Remove after a delay to show completion
            setTimeout(() => {
                this.state.pendingWorkouts.splice(index, 1);
                this.saveData();
                this.renderPunishmentsView();
            }, 1000);
            
            this.showNotification('Workout completed! Good job!', 'success');
        }
    }

    // Rewards System
    redeemReward(rewardId) {
        const reward = this.state.rewards.find(r => r.id === rewardId);
        if (!reward) return;

        if (this.state.gems >= reward.cost) {
            this.state.gems -= reward.cost;
            this.saveData();
            this.renderAll();
            
            this.showNotification(
                `Reward redeemed: ${reward.name}! Enjoy!`, 
                'success'
            );
            
            // Show confirmation modal
            this.showConfirmModal(
                'Reward Redeemed!',
                `You've redeemed: ${reward.name}. Enjoy your reward!`
            );
        } else {
            this.showNotification('Not enough gems! Complete more habits.', 'error');
        }
    }

    // Progress Tracking
    updateStreak(success) {
        const today = this.getTodayDate();
        const lastStreakDate = localStorage.getItem('lastStreakDate');
        
        if (success) {
            if (!lastStreakDate) {
                this.state.streak = 1;
            } else {
                const lastDate = new Date(lastStreakDate);
                const currentDate = new Date(today);
                const diffTime = Math.abs(currentDate - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    this.state.streak++;
                } else if (diffDays > 1) {
                    this.state.streak = 1; // Reset streak
                }
            }
            localStorage.setItem('lastStreakDate', today);
        } else {
            this.state.streak = 0;
        }
    }

    checkLevelUp() {
        const oldLevel = this.state.level;
        this.state.level = Math.floor(Math.sqrt(this.state.gems / 100)) + 1;
        
        if (this.state.level > oldLevel) {
            this.showNotification(
                `Level Up! You're now level ${this.state.level}!`,
                'success'
            );
        }
    }

    // UI Rendering
    renderAll() {
        this.renderDashboard();
        this.renderHabits();
        this.renderRewards();
        this.renderPunishments();
        this.updateGemDisplay();
    }

    renderDashboard() {
        const today = this.getTodayDate();
        const todayHabits = this.state.habits.filter(habit => 
            !habit.completedDates.includes(today)
        );
        
        document.getElementById('currentStreak').textContent = `${this.state.streak} days`;
        document.getElementById('todayProgress').textContent = 
            `${this.state.habits.length - todayHabits.length}/${this.state.habits.length}`;
        document.getElementById('userLevel').textContent = this.state.level;
        
        const todayList = document.getElementById('todayHabitsList');
        todayList.innerHTML = todayHabits.length > 0 ? 
            todayHabits.map(habit => this.createHabitHTML(habit)).join('') :
            '<p class="empty-state">All habits completed for today! 🎉</p>';
        
        // Update motivation text
        const motivationText = document.getElementById('motivationText');
        if (this.state.streak > 7) {
            motivationText.textContent = `Amazing ${this.state.streak}-day streak! Keep going! 🔥`;
        } else if (this.state.streak > 3) {
            motivationText.textContent = `Great ${this.state.streak}-day streak! You're doing well!`;
        } else {
            const messages = [
                "Every small step counts! Complete habits to earn gems!",
                "Consistency is key! Build your streak today!",
                "Earn gems and redeem awesome rewards!",
                "Don't break the chain! Keep going!"
            ];
            motivationText.textContent = messages[Math.floor(Math.random() * messages.length)];
        }
    }

    renderHabits(filter = 'all') {
        const habitsList = document.getElementById('habitsList');
        let filteredHabits = this.state.habits;
        
        if (filter !== 'all') {
            filteredHabits = this.state.habits.filter(habit => habit.difficulty === filter);
        }
        
        if (filteredHabits.length === 0) {
            habitsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-plus-circle" style="font-size: 3rem; color: var(--gray-color); margin-bottom: 16px;"></i>
                    <p>No habits yet. Add your first habit to get started!</p>
                </div>
            `;
        } else {
            habitsList.innerHTML = filteredHabits.map(habit => this.createHabitHTML(habit)).join('');
        }
    }

    renderRewards() {
        const rewardsList = document.getElementById('rewardsList');
        rewardsList.innerHTML = this.state.rewards.map(reward => `
            <div class="reward-item">
                <div>
                    <h3>${reward.name}</h3>
                    <p style="color: var(--gray-color); font-size: 0.9rem; margin-top: 4px;">
                        ${reward.description || 'No description'}
                    </p>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div class="reward-cost">
                        <i class="fas fa-gem"></i>
                        ${reward.cost}
                    </div>
                    <button class="redeem-btn" onclick="app.redeemReward(${reward.id})" 
                            ${this.state.gems < reward.cost ? 'disabled style="opacity: 0.5;"' : ''}>
                        Redeem
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderPunishments() {
        const punishmentsList = document.getElementById('punishmentsList');
        punishmentsList.innerHTML = this.state.punishments.map(punishment => `
            <div class="punishment-item">
                <div>
                    <h3>${punishment.name}</h3>
                    <p style="color: var(--gray-color); font-size: 0.9rem; margin-top: 4px;">
                        ${punishment.reps} • ${punishment.difficulty}
                    </p>
                </div>
                <div class="punishment-cost">
                    -${punishment.gemLoss} <i class="fas fa-gem"></i>
                </div>
            </div>
        `).join('');
        
        // Render pending workouts
        const pendingWorkouts = document.getElementById('pendingWorkouts');
        if (this.state.pendingWorkouts.length === 0) {
            pendingWorkouts.innerHTML = '<p style="color: var(--gray-color); text-align: center;">No pending workouts!</p>';
        } else {
            pendingWorkouts.innerHTML = this.state.pendingWorkouts
                .filter(w => !w.completed)
                .map(workout => `
                    <div class="pending-workout ${workout.completed ? 'completed' : ''}">
                        <div>
                            <h3>${workout.name}</h3>
                            <p style="color: var(--danger-color); font-weight: 600; margin-top: 4px;">
                                ${workout.reps}
                            </p>
                        </div>
                        <button class="complete-btn" onclick="app.completeWorkout(${workout.id})">
                            Complete
                        </button>
                    </div>
                `).join('');
        }
    }

    createHabitHTML(habit) {
        const today = this.getTodayDate();
        const isCompletedToday = habit.completedDates.includes(today);
        const gemRewards = { easy: 5, medium: 10, hard: 20 };
        const reward = gemRewards[habit.difficulty] * habit.importance;
        
        return `
            <div class="habit-item ${isCompletedToday ? 'completed' : ''}">
                <div class="habit-header">
                    <div>
                        <div class="habit-title">
                            ${habit.name}
                            <span class="habit-difficulty ${habit.difficulty}">
                                ${habit.difficulty}
                            </span>
                        </div>
                        <div class="habit-category">
                            ${habit.category}
                        </div>
                    </div>
                    <div class="habit-reward">
                        <i class="fas fa-gem"></i>
                        ${reward}
                    </div>
                </div>
                <div class="habit-importance">
                    ${'★'.repeat(habit.importance)}${'☆'.repeat(5 - habit.importance)}
                </div>
                <div class="habit-stats" style="margin-top: 8px; font-size: 0.9rem; color: var(--gray-color);">
                    ✅ ${habit.totalCompletions} • ❌ ${habit.totalFails}
                </div>
                <div class="habit-actions">
                    <button class="habit-btn complete" 
                            onclick="app.completeHabit(${habit.id})"
                            ${isCompletedToday ? 'disabled style="opacity: 0.5;"' : ''}>
                        <i class="fas fa-check"></i> Complete
                    </button>
                    <button class="habit-btn fail" 
                            onclick="app.failHabit(${habit.id})">
                        <i class="fas fa-times"></i> Fail
                    </button>
                </div>
            </div>
        `;
    }

    updateGemDisplay() {
        document.getElementById('totalGems').textContent = this.state.gems;
    }

    // Event Handlers
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
                
                // Update active state
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.renderHabits(filter);
            });
        });

        // Add Habit
        document.getElementById('addHabitBtn').addEventListener('click', () => {
            this.showHabitModal();
        });

        document.getElementById('habitForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const habit = {
                name: document.getElementById('habitName').value,
                category: document.getElementById('habitCategory').value,
                difficulty: document.getElementById('habitDifficulty').value,
                importance: parseInt(document.getElementById('habitImportance').value)
            };
            this.addHabit(habit);
            this.hideModal('habitModal');
        });

        // Add Reward
        document.getElementById('addRewardBtn').addEventListener('click', () => {
            this.showRewardModal();
        });

        document.getElementById('rewardForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const reward = {
                id: Date.now(),
                name: document.getElementById('rewardName').value,
                cost: parseInt(document.getElementById('rewardCost').value),
                description: document.getElementById('rewardDescription').value
            };
            this.state.rewards.push(reward);
            this.saveData();
            this.renderRewards();
            this.hideModal('rewardModal');
            this.showNotification('Reward added!', 'success');
        });

        // Add Punishment
        document.getElementById('addPunishmentBtn').addEventListener('click', () => {
            this.showPunishmentModal();
        });

        document.getElementById('punishmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const punishment = {
                id: Date.now(),
                name: document.getElementById('punishmentName').value,
                reps: document.getElementById('punishmentReps').value,
                gemLoss: parseInt(document.getElementById('punishmentGemLoss').value),
                difficulty: document.getElementById('punishmentDifficulty').value
            };
            this.state.punishments.push(punishment);
            this.saveData();
            this.renderPunishments();
            this.hideModal('punishmentModal');
            this.showNotification('Workout punishment added!', 'success');
        });

        // Cancel buttons
        document.getElementById('cancelHabitBtn').addEventListener('click', () => {
            this.hideModal('habitModal');
        });
        document.getElementById('cancelRewardBtn').addEventListener('click', () => {
            this.hideModal('rewardModal');
        });
        document.getElementById('cancelPunishmentBtn').addEventListener('click', () => {
            this.hideModal('punishmentModal');
        });

        // Importance stars
        const importanceInput = document.getElementById('habitImportance');
        const stars = document.querySelectorAll('.importance-display .star');
        
        importanceInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            stars.forEach((star, index) => {
                star.classList.toggle('active', index < value);
            });
        });

        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                importanceInput.value = index + 1;
                importanceInput.dispatchEvent(new Event('input'));
            });
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    // UI Helpers
    switchView(viewName) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(viewName).classList.add('active');
    }

    showHabitModal() {
        document.getElementById('habitModalTitle').textContent = 'Add New Habit';
        document.getElementById('habitForm').reset();
        document.getElementById('habitImportance').value = 3;
        document.getElementById('habitImportance').dispatchEvent(new Event('input'));
        this.showModal('habitModal');
    }

    showRewardModal() {
        document.getElementById('rewardForm').reset();
        this.showModal('rewardModal');
    }

    showPunishmentModal() {
        document.getElementById('punishmentForm').reset();
        this.showModal('punishmentModal');
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    showConfirmModal(title, message) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        this.showModal('confirmModal');
    }
}

// Initialize the app
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new HabitTracker();
    
    // Make app available globally for onclick handlers
    window.app = app;
    
    // Close confirmation modal
    document.getElementById('confirmCancelBtn').addEventListener('click', () => {
        app.hideModal('confirmModal');
    });
    
    document.getElementById('confirmOkBtn').addEventListener('click', () => {
        app.hideModal('confirmModal');
    });
});

// Add PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}