# WebClicker - Precision Aim Training

A sophisticated browser-based aim training game with advanced performance analytics and research-based grading systems.

[![Play Now](https://img.shields.io/badge/🎯_Play_Now-WebClicker-blue?style=for-the-badge&logo=github)](https://sangraphic.github.io/WebClicker/)

## 🎯 Features

### **Advanced Performance Rating System**
- **Research-Based Benchmarks**: Grading based on human and esports reaction time studies
- **Game Mode Adaptations**: Different scoring for Speed Test, Precision, and Jumbo Tile Frenzy modes
- **Robust Statistics**: Outlier removal and trimmed mean calculations for fairer grading
- **Warm-Up Period**: First 5 targets tracked separately (not graded) for adjustment time
- **Streak Bonuses**: Rewards sustained excellence with performance bonuses

### **Comprehensive Analytics**
- **Performance Tiers**: Professional, Advanced, Intermediate, Beginner classifications
- **Percentile Rankings**: Compare against general population benchmarks
- **Detailed Metrics**: Reaction time scores, accuracy scores, consistency ratings
- **Session History**: Track progress over time with detailed statistics

### **Customizable Training**
- **Multiple Game Modes**: Jumbo Tile Frenzy, Speed Test, Precision training
- **Difficulty Levels**: Easy, Medium, Hard, Expert with adaptive parameters
- **Crosshair Customization**: Multiple styles, sizes, and colors
- **Sensitivity Settings**: Configure for different games (Overwatch, Valorant, CS:GO, etc.)

## 🚀 Quick Start

1. **Click the Play Button Above** to start training immediately
2. **Choose Your Settings**: Select difficulty, game mode, and crosshair preferences
3. **Start Training**: Hit targets as they appear for 30 seconds
4. **Analyze Performance**: Review detailed statistics and performance metrics

## 📊 Performance Grading

### **Grade Tiers**
- **S+**: Exceptional performance (95+ overall score, 90+ reaction time, 90+ accuracy)
- **S**: Outstanding (90+ overall score)
- **A+**: Excellent (85+ overall score)
- **A**: Very Good (80+ overall score)
- **B+**: Good (75+ overall score)
- **B**: Above Average (70+ overall score)
- **C+**: Average (65+ overall score)
- **C**: Below Average (60+ overall score)
- **D**: Poor (50+ overall score)
- **F**: Needs Improvement (<50 overall score)

### **Performance Tiers**
- **Professional**: <350ms reaction time + 90%+ accuracy
- **Advanced**: <500ms reaction time + 80%+ accuracy
- **Intermediate**: <700ms reaction time + 70%+ accuracy
- **Beginner**: >700ms reaction time or <70% accuracy

## 🎮 Game Modes

### **Jumbo Tile Frenzy** (Balanced)
- Standard target spawning
- 50/50 reaction time and accuracy weighting
- Perfect for general aim training

### **Speed Test** (Reflex-Focused)
- Faster spawning, shorter target lifetime
- 55% reaction time, 45% accuracy weighting
- 20% stricter reaction time benchmarks

### **Precision** (Accuracy-Focused)
- Slower spawning, smaller targets
- 40% reaction time, 60% accuracy weighting
- 15% more lenient reaction time, 10% stricter accuracy

## 🔬 Research-Based Benchmarks

The grading system is built on extensive research into human and esports reaction times:

- **Professional Esports (FPS)**: 300ms average (continuous target scenario)
- **Casual Gamers**: 400ms average
- **General Population**: 500ms average
- **Excellent Performance**: <400ms
- **Good Performance**: 400-500ms
- **Average Performance**: 500-600ms

*Note: Benchmarks account for the full process of seeing a target, aiming, and clicking in continuous spawning scenarios.*

## 🛠️ Technical Features

### **Advanced Statistics**
- **Trimmed Mean**: Removes top/bottom 10% of reaction times for robust averaging
- **Outlier Removal**: Prevents lucky shots or distractions from skewing grades
- **Streak Tracking**: Monitors consecutive "good" hits for bonus scoring
- **Fatigue Adjustment**: Accounts for performance degradation over time

### **Fair Scoring System**
- **Warm-Up Exclusion**: First 5 targets don't count toward final grade
- **Distance Weighting**: Accounts for target spawn positions (planned)
- **Consistency Rewards**: Bonus points for sustained performance
- **Game Mode Awareness**: Different expectations for different training modes

## 📈 Performance Metrics

### **Core Metrics**
- **Reaction Time Score**: 0-100 based on research benchmarks
- **Accuracy Score**: 0-100 based on hit/miss ratio
- **Overall Score**: Weighted combination with consistency modifier
- **Performance Tier**: Skill level classification
- **Percentile Ranking**: Comparison to general population

### **Advanced Analytics**
- **Best Streak**: Maximum consecutive good hits
- **Streak Bonus**: Percentage bonus earned from consistency
- **Warm-up Average**: Reaction time for first 5 targets
- **Consistency Rating**: Standard deviation analysis
- **Click Efficiency**: Hits per total clicks ratio

## 🎯 Controls

- **Mouse**: Aim and click to hit targets
- **ESC**: Pause game
- **R**: Restart game
- **M**: Return to main menu
- **Tab**: Quick restart
- **F11**: Toggle fullscreen

## 🌐 Browser Compatibility

- **Chrome**: Recommended (best performance)
- **Firefox**: Fully supported
- **Safari**: Supported
- **Edge**: Supported

## 📱 Mobile Support

- **Touch Controls**: Tap to hit targets
- **Responsive Design**: Adapts to different screen sizes
- **Performance Optimized**: Smooth gameplay on mobile devices

## 🔧 Local Development

To run the game locally:

```bash
# Clone the repository
git clone https://github.com/sangraphic/WebClicker.git

# Navigate to the directory
cd WebClicker

# Start a local server
npx http-server -p 8000

# Open in browser
open http://localhost:8000
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have suggestions, please open an issue on GitHub.

---

**Ready to improve your aim?** [Click here to start training!](https://sangraphic.github.io/WebClicker/) 🎯
