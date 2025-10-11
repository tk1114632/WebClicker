// Aimlabs Replica - Jumbo Tile Frenzy
class AimlabsGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.targets = [];
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.hits = 0;
        this.misses = 0;
        this.consecutiveHits = 0;
        this.currentTarget = null;

        // Advanced performance tracking
        this.hitTimes = []; // Array of reaction times for each hit
        this.hitTimestamps = []; // When each hit occurred
        this.targetSpawnTimes = []; // When each target spawned
        this.performanceData = {
            totalClicks: 0,
            averageReactionTime: 0,
            consistency: 0,
            accuracy: 0,
            grade: 'F'
        };
        this.targetSpawnTimer = 0;
        this.targetLifetime = 2000; // 2 seconds
        this.spawnDelay = 1000; // 1 second between spawns
        this.difficulty = 'medium';
        this.gameMode = 'jumbo-tile-frenzy';
        this.maxTargets = 3; // Default for medium difficulty
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.raycaster.near = 0.1;
        this.raycaster.far = 500; // Increased range to ensure we never miss targets
        this.centerVector = new THREE.Vector2(0, 0); // Pre-create center vector for instant raycasting
        this.mouseSensitivity = 0.002;
        this.mouseSensitivityV = null; // For separate vertical sensitivity
        this.cameraRotation = { x: 0, y: 0 };
        this.lastClickTime = 0; // For preventing double-clicks
        this.crosshairElement = document.querySelector('.crosshair');


        // Mouse smoothing disabled for maximum responsiveness
        this.mouseSmoothing = {
            enabled: false,
            factor: 0,
            lastDeltaX: 0,
            lastDeltaY: 0
        };



        // Particle system
        this.particles = [];

        // Audio system
        this.audioContext = null;
        this.hitSoundBuffer = null;
        this.missSoundBuffer = null;

        // Crosshair system
        this.crosshairStyle = 'default';
        this.crosshairSize = 20;
        this.crosshairThickness = 2;
        this.crosshairDot = false;

        // Basic FOV data for games
        this.gameFOV = {
            overwatch: 103,
            valorant: 103,
            csgo: 90,
            apex: 110,
            fortnite: 90,
            cod: 90,
            rainbow: 90
        };

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            90, // Default FOV
            window.innerWidth / window.innerHeight,
            0.1,
            2000 // Increased far clipping plane
        );
        this.camera.position.set(0, 0, 5);
        this.camera.rotation.order = 'YXZ'; // FPS camera rotation order
        this.fov = 90;
        this.camera.updateProjectionMatrix(); // Ensure projection matrix is updated

        // Renderer setup - balanced quality/performance
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true, // Enable antialiasing for smoother edges
            powerPreference: 'high-performance',
            depth: true,
            stencil: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0)); // Use device pixel ratio up to 1.0 for quality
        this.renderer.shadowMap.enabled = false; // Keep shadows disabled for performance
        this.renderer.sortObjects = true; // Ensure proper object sorting

        // Ensure viewport covers full canvas
        this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        this.renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
        this.renderer.setScissorTest(false);

        // Ensure canvas fills the container
        const canvas = this.renderer.domElement;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';

        // Lighting setup
        this.setupLighting();

        // Audio setup
        this.setupAudio();

        // Create game area (invisible walls/floor)
        this.createGameArea();

        // Apply initial settings
        this.applyDifficultySettings();
        this.applyGameModeSettings();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Handle pointer lock changes
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (main light) - no shadows for potato preset
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = false; // Potato preset: no shadows
        this.scene.add(directionalLight);

        // Point light for additional illumination
        const pointLight = new THREE.PointLight(0x4ecdc4, 0.5, 100);
        pointLight.position.set(-10, 0, 10);
        this.scene.add(pointLight);
    }

    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.loadAudioBuffers();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    async loadAudioBuffers() {
        if (!this.audioContext) return;

        try {
            // Create simple synthesized sounds instead of loading external files
            this.hitSoundBuffer = this.createHitSound();
            this.missSoundBuffer = this.createMissSound();
        } catch (e) {
            console.warn('Error loading audio buffers:', e);
        }
    }

    createHitSound() {
        const duration = 0.12; // 120ms
        const sampleRate = this.audioContext.sampleRate;
        const frameCount = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
        const channelData = buffer.getChannelData(0);

        // Create a gentle hit sound with triangle wave
        for (let i = 0; i < frameCount; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 12); // Slower decay for gentler sound

            // Triangle wave with frequency sweep
            const frequency = 800 - t * 400; // Start high and sweep down
            const phase = (i / sampleRate) * frequency * 2 * Math.PI;
            const triangle = Math.asin(Math.sin(phase)) * (2 / Math.PI); // Triangle wave

            channelData[i] = triangle * envelope * 0.15; // Much softer volume
        }

        return buffer;
    }

    createMissSound() {
        const duration = 0.18; // 180ms
        const sampleRate = this.audioContext.sampleRate;
        const frameCount = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
        const channelData = buffer.getChannelData(0);

        // Create a gentle miss sound with soft triangle wave
        for (let i = 0; i < frameCount; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 10); // Gentle decay
            const frequency = 150; // Low frequency for miss
            const phase = (i / sampleRate) * frequency * 2 * Math.PI;
            const triangle = Math.asin(Math.sin(phase)) * (2 / Math.PI); // Triangle wave

            channelData[i] = triangle * envelope * 0.12; // Soft volume
        }

        return buffer;
    }

    playSound(buffer) {
        if (!this.audioContext || !buffer) return;

        try {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start();
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }

    playHitSound() {
        this.playSound(this.hitSoundBuffer);
    }

    playMissSound() {
        this.playSound(this.missSoundBuffer);
    }

    createParticles(position, color = 0x4ecdc4, count = 4) {
        for (let i = 0; i < count; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.02, 6, 6); // Reduced segments for performance
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8
            });

            const particle = new THREE.Mesh(particleGeometry, particleMaterial);

            // Set initial position with smaller spread
            particle.position.copy(position);
            particle.position.x += (Math.random() - 0.5) * 0.3;
            particle.position.y += (Math.random() - 0.5) * 0.3;
            particle.position.z += (Math.random() - 0.5) * 0.3;

            // Gentle velocity with subtle gravity
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.03 + Math.random() * 0.06; // Gentler speed
            particle.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed + 0.01, // Subtle upward bias
                (Math.random() - 0.5) * 0.02
            );

            particle.gravity = -0.001; // Light gravity effect
            particle.life = 1.0;
            particle.size = 0.015 + Math.random() * 0.01; // Smaller, more uniform size

            this.scene.add(particle);
            this.particles.push(particle);
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            // Apply gentle gravity
            particle.velocity.y += particle.gravity;

            // Update position
            particle.position.add(particle.velocity);

            // Update life with gentle decay
            particle.life -= 0.012 + Math.random() * 0.005;
            particle.material.opacity = particle.life;

            // Subtle size animation
            const sizeMultiplier = 1 + Math.sin(particle.life * Math.PI * 2) * 0.1;
            particle.scale.setScalar(particle.size * sizeMultiplier);

            // Remove dead particles
            if (particle.life <= 0) {
                this.scene.remove(particle);
                this.particles.splice(i, 1);
            }
        }
    }

    createGameArea() {
        // Create a large invisible plane as the game area
        const planeGeometry = new THREE.PlaneGeometry(20, 20);
        const planeMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0
        });
        this.gamePlane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.gamePlane.position.z = -2;
        this.scene.add(this.gamePlane);
    }

    setupEventListeners() {
        // Mouse events - use mousedown for responsive hit detection
        document.addEventListener('mousemove', (event) => this.onMouseMove(event));
        document.addEventListener('mousedown', (event) => this.onMouseClick(event));

        // Keyboard events for pause menu - attach to both document and canvas for pointer lock compatibility
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        this.renderer.domElement.addEventListener('keydown', (event) => this.onKeyDown(event));

        // UI button events
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.fullRestart());
        document.getElementById('menu-btn').addEventListener('click', () => this.returnToMenu());

        // Pause menu button events
        document.getElementById('restart-pause-btn').addEventListener('click', () => this.fullRestart());
        document.getElementById('menu-pause-btn').addEventListener('click', () => this.returnToMenu());

        // Settings event listeners
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.applyDifficultySettings();
        });
        document.getElementById('game-mode-select').addEventListener('change', (e) => {
            this.gameMode = e.target.value;
            this.applyGameModeSettings();
        });
        document.getElementById('target-lifetime').addEventListener('input', (e) => {
            this.targetLifetime = e.target.value * 1000;
            document.getElementById('target-lifetime-value').textContent = e.target.value + 's';
        });
        document.getElementById('spawn-delay').addEventListener('input', (e) => {
            this.spawnDelay = e.target.value * 1000;
            document.getElementById('spawn-delay-value').textContent = e.target.value + 's';
        });
        document.getElementById('fov-slider').addEventListener('input', (e) => {
            this.fov = parseInt(e.target.value);
            this.camera.fov = this.fov;
            this.camera.updateProjectionMatrix();
            document.getElementById('fov-value').textContent = this.fov + '°';
        });

        // Crosshair settings event listeners
        document.getElementById('crosshair-style').addEventListener('change', (e) => {
            this.crosshairStyle = e.target.value;
            this.updateCrosshairStyle();
            this.saveCrosshairSettings();
        });
        document.getElementById('crosshair-size').addEventListener('input', (e) => {
            this.crosshairSize = parseInt(e.target.value);
            document.getElementById('crosshair-size-value').textContent = this.crosshairSize + 'px';
            this.updateCrosshairSize();
            this.saveCrosshairSettings();
        });
        document.getElementById('crosshair-thickness').addEventListener('input', (e) => {
            this.crosshairThickness = parseInt(e.target.value);
            document.getElementById('crosshair-thickness-value').textContent = this.crosshairThickness + 'px';
            this.updateCrosshairThickness();
            this.saveCrosshairSettings();
        });
        document.getElementById('crosshair-dot').addEventListener('change', (e) => {
            this.crosshairDot = e.target.checked;
            this.updateCrosshairDot();
            this.saveCrosshairSettings();
        });
        document.getElementById('reset-crosshair-btn').addEventListener('click', () => {
            this.resetCrosshairSettings();
        });
        document.getElementById('preview-crosshair-btn').addEventListener('click', () => {
            this.previewCrosshair();
        });

        // Sensitivity settings event listeners
        document.getElementById('game-select').addEventListener('change', (e) => {
            const game = e.target.value;
            const fov = this.gameFOV[game] || 90;
            document.getElementById('fov-input').placeholder = fov.toString();
            document.getElementById('fov-input').value = fov.toString();
        });

        document.getElementById('separate-axes').addEventListener('change', (e) => {
            const container = document.getElementById('separate-axes-container');
            container.style.display = e.target.checked ? 'block' : 'none';
        });

        document.getElementById('test-sens-btn').addEventListener('click', () => this.testSensitivity());
        document.getElementById('save-sens-btn').addEventListener('click', () => this.saveSensitivity());

        // Quick preset buttons
        document.getElementById('preset-ow').addEventListener('click', () => this.loadPreset('overwatch'));
        document.getElementById('preset-valorant').addEventListener('click', () => this.loadPreset('valorant'));
        document.getElementById('preset-fortnite').addEventListener('click', () => this.loadPreset('fortnite'));
        document.getElementById('preset-csgo').addEventListener('click', () => this.loadPreset('csgo'));

        // Audio context resume on user interaction (required by some browsers)
        document.addEventListener('click', () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });

        // History button event listener
        document.getElementById('clear-history-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all game history? This cannot be undone.')) {
                this.clearHistory();
            }
        });

        // Load saved settings
        this.loadSavedSensitivitySettings();
        this.loadCrosshairSettings();

        // Set initial FOV value
        document.getElementById('fov-input').value = this.gameFOV.fortnite;

        // Test localStorage
        try {
            localStorage.setItem('test_key', 'test_value');
            const testValue = localStorage.getItem('test_key');
            console.log('localStorage test:', testValue === 'test_value' ? 'WORKING' : 'NOT WORKING');
            localStorage.removeItem('test_key');

            // Check if history exists
            const existingHistory = localStorage.getItem('webclicker_game_history');
            console.log('Existing history in localStorage:', existingHistory);
        } catch (e) {
            console.error('localStorage test failed:', e);
        }

        // Initialize history display after a short delay to ensure DOM is fully loaded
        setTimeout(() => {
            this.updateHistoryDisplay();
        }, 100);
    }

    onMouseMove(event) {
        if (this.gameState !== 'playing') return;

        // FPS-style camera rotation
        let deltaX = event.movementX || 0;
        let deltaY = event.movementY || 0;

        // Clamp mouse movement to prevent large jumps (caused by pointer lock issues)
        const maxMovement = 100; // Maximum pixels per frame to prevent jumps
        deltaX = Math.max(-maxMovement, Math.min(maxMovement, deltaX));
        deltaY = Math.max(-maxMovement, Math.min(maxMovement, deltaY));

        // Apply mouse smoothing to prevent camera jumps
        if (this.mouseSmoothing.enabled) {
            deltaX = this.mouseSmoothing.lastDeltaX * this.mouseSmoothing.factor + deltaX * (1 - this.mouseSmoothing.factor);
            deltaY = this.mouseSmoothing.lastDeltaY * this.mouseSmoothing.factor + deltaY * (1 - this.mouseSmoothing.factor);

            this.mouseSmoothing.lastDeltaX = deltaX;
            this.mouseSmoothing.lastDeltaY = deltaY;
        }

        // Use separate sensitivities if available, otherwise use the same for both axes
        const sensH = this.mouseSensitivity;
        const sensV = this.mouseSensitivityV || this.mouseSensitivity;

        // Only apply movement if values are valid numbers
        if (isFinite(deltaX) && isFinite(deltaY) && isFinite(sensH) && isFinite(sensV)) {
            this.cameraRotation.y -= deltaX * sensH;
            this.cameraRotation.x -= deltaY * sensV;

        // Limit vertical rotation
        this.cameraRotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.cameraRotation.x));

        // Limit horizontal rotation to prevent floating point issues
        this.cameraRotation.y = this.cameraRotation.y % (Math.PI * 2);

            // Ensure camera rotation values are valid
            if (isFinite(this.cameraRotation.y) && isFinite(this.cameraRotation.x)) {
                // Reset camera rotation and apply fresh rotation for stable FPS controls
                this.camera.rotation.set(0, 0, 0);
                this.camera.rotateY(this.cameraRotation.y);
                this.camera.rotateX(this.cameraRotation.x);
                this.camera.updateMatrixWorld(); // Ensure camera matrices are updated
            } else {
                // Reset camera rotation if it became invalid
                this.cameraRotation = { x: 0, y: 0 };
                this.camera.rotation.set(0, 0, 0);
            }
        }
    }

    onMouseClick(event) {
        // Only prevent default behavior and process game clicks when actually playing
        // Allow normal form interactions when not in game
        if (this.gameState !== 'playing') return;

        // Ensure pointer is still locked before processing clicks
        if (document.pointerLockElement !== document.body) {
            return; // Don't process clicks if pointer lock is lost
        }

        event.preventDefault(); // Prevent default browser behavior for game clicks

        // Track total clicks for performance analysis
        this.performanceData.totalClicks++;

        // Ultra-fast, dead-center raycasting for instant hit detection
        this.raycaster.setFromCamera(this.centerVector, this.camera);

        // Try raycasting first
        const intersects = this.raycaster.intersectObjects(this.targets, false);

        let hitFound = false;

        if (intersects.length > 0) {
            // Get the first (closest) intersection
            const hitTarget = intersects[0].object;

            if (!hitTarget.beingRemoved) {
                this.hitTarget(hitTarget);
                hitFound = true;
            }
        }

        // Fallback: Check targets by angle/distance if raycast fails
        if (!hitFound) {
            const cameraDirection = new THREE.Vector3();
            this.camera.getWorldDirection(cameraDirection);

            for (const target of this.targets) {
                if (target.beingRemoved) continue;

                // Calculate vector from camera to target
                const targetVector = target.position.clone().sub(this.camera.position);
                const distance = targetVector.length();

                // Check if target is in front of camera and within range
                if (distance < 15) { // Within reasonable range
                    targetVector.normalize();

                    // Calculate angle between camera direction and target direction
                    const dot = cameraDirection.dot(targetVector);
                    const angle = Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);

                    // If angle is small enough (target is roughly in center), count as hit
                    if (angle < 5) { // Within 5 degrees of center
                        this.hitTarget(target);
                        hitFound = true;
                        break;
                    }
                }
            }
        }

        if (!hitFound) {
            this.missTarget();
        }
    }

    onKeyDown(event) {
        // Global shortcuts
        if (event.code === 'F11') {
            event.preventDefault();
            // Toggle fullscreen
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
            return;
        }

        // Tab key - global restart shortcut
        if (event.code === 'Tab') {
            event.preventDefault(); // Prevent tab switching in browser
            this.fullRestart();
            return;
        }

            if (this.gameState === 'playing') {
            if (event.code === 'Escape') {
                this.pauseGame();
            } else if (event.code === 'KeyR') {
                this.fullRestart();
            } else if (event.code === 'KeyM') {
                this.returnToMenu();
            } else if (event.code === 'KeyP') {
                this.pauseGame();
            }
            } else if (this.gameState === 'paused') {
            if (event.code === 'Escape' || event.code === 'Space' || event.code === 'KeyP') {
                this.resumeGame();
            }
        } else if (this.gameState === 'gameOver') {
            if (event.code === 'Space' || event.code === 'Enter' || event.code === 'KeyR') {
                this.fullRestart();
            } else if (event.code === 'Escape' || event.code === 'KeyM') {
                this.returnToMenu();
            }
        } else if (this.gameState === 'menu') {
            if (event.code === 'Enter' || event.code === 'Space') {
                this.startGame();
            }
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Ensure viewport covers full resized canvas
        this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        this.renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
        this.renderer.setScissorTest(false);

        // Ensure canvas fills the resized container
        const canvas = this.renderer.domElement;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
    }

    onPointerLockChange() {
        if (document.pointerLockElement === document.body) {
            // Pointer is locked - show crosshair
            this.crosshairElement.style.display = 'block';
        } else {
            // Pointer is unlocked - hide crosshair
            this.crosshairElement.style.display = 'none';
            if (this.gameState === 'playing') {
                // Game continues but mouse input is ignored until pointer is relocked
            }
        }
    }

    playAgain() {
        // Clean up the scene like restartGame() but start new game directly
        this.gameState = 'playing';

        // Clear all 3D objects from scene (except lights and game area)
        const objectsToKeep = [];
        const objectsToRemove = [];

        // Separate objects we want to keep (lights, game area) from objects to remove (targets, particles)
        this.scene.children.forEach(child => {
            if (child.type === 'AmbientLight' || child.type === 'DirectionalLight' || child === this.gamePlane) {
                objectsToKeep.push(child);
            } else {
                objectsToRemove.push(child);
            }
        });

        // Remove and dispose of game objects
        objectsToRemove.forEach(child => {
            this.scene.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });

        // Clear all game data
        this.targets = [];
        this.currentTarget = null;
        this.targetSpawnTimer = 0;

        // Reset camera position (keep rotation for continuity)
        this.camera.position.set(0, 0, 5);

        // Reset all game statistics
        this.score = 0;
        this.hits = 0;
        this.misses = 0;
        this.consecutiveHits = 0;
        this.elapsedTime = 0;
        this.startTime = Date.now();

        // Clear all particle effects
        this.particles = [];

        // Reset performance tracking
        this.hitTimes = [];
        this.hitTimestamps = [];
        this.targetSpawnTimes = [];
        this.performanceData = {
            totalClicks: 0,
            averageReactionTime: 0,
            consistency: 0,
            accuracy: 0,
            grade: 'F'
        };

        // Hide end game UI, show game UI
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('game-ui').style.display = 'block';

        // Clear any leftover DOM elements
        const hitFeedbacks = document.querySelectorAll('.hit-feedback');
        hitFeedbacks.forEach(el => el.remove());

        const highlights = document.querySelectorAll('.target-highlight');
        highlights.forEach(el => el.remove());

        // Spawn initial 3 targets
        for (let i = 0; i < 3; i++) {
            this.spawnTarget();
        }

        // Show crosshair and lock pointer for FPS controls
        this.crosshairElement.style.display = 'block';
        document.body.requestPointerLock();

        // Hide sensitivity converter during gameplay
        document.getElementById('sensitivity-converter').style.display = 'none';

        this.updateUI();
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.hits = 0;
        this.misses = 0;
        this.consecutiveHits = 0;
        this.elapsedTime = 0;
        this.startTime = Date.now();
        this.targets = [];
        this.currentTarget = null;
        this.targetSpawnTimer = 0;

        // Initialize performance tracking
        this.hitTimes = [];
        this.hitTimestamps = [];
        this.targetSpawnTimes = [];
        this.performanceData = {
            totalClicks: 0,
            averageReactionTime: 0,
            consistency: 0,
            accuracy: 0,
            grade: 'F'
        };

        // Hide menu, show game
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        document.getElementById('game-ui').style.display = 'block';

        // Spawn initial 3 targets
        for (let i = 0; i < 3; i++) {
            this.spawnTarget();
        }

        // Show crosshair and lock pointer for FPS controls
        this.crosshairElement.style.display = 'block';
        document.body.requestPointerLock();

        // Hide sensitivity converter during gameplay
        document.getElementById('sensitivity-converter').style.display = 'none';

        this.updateUI();
    }

    fullRestart() {
        try {
            // Complete scene destruction and recreation (like page refresh)
            this.gameState = 'playing';

            // Completely destroy the existing scene
            while (this.scene.children.length > 0) {
                const child = this.scene.children[0];
                this.scene.remove(child);
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            }

            // Reinitialize scene components as if page just loaded
            this.setupLighting();
            this.createGameArea();

            // Reset camera to initial state
            this.camera.position.set(0, 0, 5);
            this.camera.rotation.set(0, 0, 0);
            this.cameraRotation = { x: 0, y: 0 };
            this.camera.fov = 90;
            this.camera.updateProjectionMatrix();

            // Reset all game state variables to initial values
            this.targets = [];
            this.currentTarget = null;
            this.targetSpawnTimer = 0;
            this.score = 0;
            this.hits = 0;
            this.misses = 0;
            this.consecutiveHits = 0;
            this.elapsedTime = 0;
            this.startTime = Date.now();
            this.particles = [];

            // Reset performance tracking to initial state
            this.hitTimes = [];
            this.hitTimestamps = [];
            this.targetSpawnTimes = [];
            this.performanceData = {
                totalClicks: 0,
                averageReactionTime: 0,
                consistency: 0,
                accuracy: 0,
                grade: 'F'
            };

            // Clear all UI overlays
            document.getElementById('game-over').style.display = 'none';
            document.getElementById('pause-menu').style.display = 'none';
            document.getElementById('main-menu').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            document.getElementById('game-ui').style.display = 'block';

            // Clear all DOM feedback elements
            const hitFeedbacks = document.querySelectorAll('.hit-feedback');
            hitFeedbacks.forEach(el => el.remove());
            const highlights = document.querySelectorAll('.target-highlight');
            highlights.forEach(el => el.remove());

            // Show crosshair and lock pointer (like initial game start)
            this.crosshairElement.style.display = 'block';
            document.body.requestPointerLock();

            // Spawn initial targets (like startGame)
            for (let i = 0; i < 3; i++) {
                this.spawnTarget();
            }

            // Update UI to show fresh game state
            this.updateUI();

        } catch (error) {
            console.error('Error in fullRestart():', error);
            // Fallback to regular restart
            this.restartGame();
        }
    }

    directRestart() {
        try {
            // Set game state to playing (important when restarting from game over)
            this.gameState = 'playing';

            // Clear all 3D objects from scene (except lights and game area)
            const objectsToKeep = [];
            const objectsToRemove = [];

            // Separate objects we want to keep (lights, game area) from objects to remove (targets, particles)
            this.scene.children.forEach(child => {
                if (child.type === 'AmbientLight' || child.type === 'DirectionalLight' || child === this.gamePlane) {
                    objectsToKeep.push(child);
                } else {
                    objectsToRemove.push(child);
                }
            });

            // Remove and dispose of game objects
            objectsToRemove.forEach(child => {
                this.scene.remove(child);
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });

            // Clear all game data
            this.targets = [];
            this.currentTarget = null;
            this.targetSpawnTimer = 0;

            // Reset camera
            this.camera.position.set(0, 0, 5);
            this.camera.rotation.set(0, 0, 0);
            this.cameraRotation = { x: 0, y: 0 };

            // Reset all game statistics
            this.score = 0;
            this.hits = 0;
            this.misses = 0;
            this.consecutiveHits = 0;
            this.elapsedTime = 0;
            this.startTime = Date.now();
            this.particles = [];

            // Reset performance tracking
            this.hitTimes = [];
            this.hitTimestamps = [];
            this.targetSpawnTimes = [];
            this.performanceData = {
                totalClicks: 0,
                averageReactionTime: 0,
                consistency: 0,
                accuracy: 0,
                grade: 'F'
            };

            // Hide UI overlays and show game UI
            document.getElementById('game-over').style.display = 'none';
            document.getElementById('pause-menu').style.display = 'none';
            document.getElementById('game-ui').style.display = 'block';

            // Clear DOM elements
            const hitFeedbacks = document.querySelectorAll('.hit-feedback');
            hitFeedbacks.forEach(el => el.remove());
            const highlights = document.querySelectorAll('.target-highlight');
            highlights.forEach(el => el.remove());

            // Show crosshair and lock pointer for gameplay
            this.crosshairElement.style.display = 'block';
            document.body.requestPointerLock();

            // Spawn new targets
            for (let i = 0; i < 3; i++) {
                this.spawnTarget();
            }

            // Update UI immediately
            this.updateUI();

        } catch (error) {
            console.error('Error in directRestart():', error);
            this.restartGame();
        }
    }

    restartGame() {
        try {
            // Comprehensive reset - clear absolutely everything from previous session
            this.gameState = 'menu';

            // Clear all 3D objects from scene
            let clearedCount = 0;
            while (this.scene.children.length > 0) {
                const child = this.scene.children[0];
                this.scene.remove(child);
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
                clearedCount++;
                if (clearedCount > 100) { // Safety check
                    console.error('Scene cleanup loop exceeded 100 iterations, breaking');
                    break;
                }
            }

            // Recreate essential scene objects
            this.setupLighting();
            this.createGameArea();

            // Clear all game data
            this.targets = [];
            this.currentTarget = null;
            this.targetSpawnTimer = 0;

            // Reset camera completely
            this.camera.position.set(0, 0, 5);
            this.camera.rotation.set(0, 0, 0);
            this.cameraRotation = { x: 0, y: 0 };

            // Reset all game statistics
            this.score = 0;
            this.hits = 0;
            this.misses = 0;
            this.consecutiveHits = 0;
            this.elapsedTime = 0;
            this.startTime = 0;

            // Clear all particle effects
            this.particles.forEach(particle => {
                this.scene.remove(particle);
            });
            this.particles = [];

            // Reset performance tracking
            this.hitTimes = [];
            this.hitTimestamps = [];
            this.targetSpawnTimes = [];
            this.performanceData = {
                totalClicks: 0,
                averageReactionTime: 0,
                consistency: 0,
                accuracy: 0,
                grade: 'F'
            };

            // Hide all UI overlays and screens
            document.getElementById('game-over').style.display = 'none';
            document.getElementById('pause-menu').style.display = 'none';
            document.getElementById('settings-screen').style.display = 'none';
            document.getElementById('sensitivity-screen').style.display = 'none';
            document.getElementById('sensitivity-backdrop').style.display = 'none';
            document.getElementById('game-ui').style.display = 'none';

            // Clear any leftover DOM elements
            const hitFeedbacks = document.querySelectorAll('.hit-feedback');
            hitFeedbacks.forEach(el => el.remove());

            const highlights = document.querySelectorAll('.target-highlight');
            highlights.forEach(el => el.remove());

            // Reset crosshair
            this.crosshairElement.style.display = 'none';
            document.exitPointerLock();

            // Start completely fresh game
            this.startGame();

        } catch (error) {
            console.error('Error in restartGame():', error);
            // Emergency fallback - just go back to menu
            this.gameState = 'menu';
            document.getElementById('game-container').style.display = 'none';
            document.getElementById('main-menu').style.display = 'block';
            document.getElementById('game-ui').style.display = 'none';
            this.crosshairElement.style.display = 'none';
            document.exitPointerLock();
        }
    }

    endGame() {
        this.gameState = 'gameOver';

        // Show game over screen
        const gameOver = document.getElementById('game-over');
        const gameUI = document.getElementById('game-ui');
        if (gameOver) gameOver.style.display = 'block';
        if (gameUI) gameUI.style.display = 'none';

        // Hide crosshair and unlock pointer
        this.crosshairElement.style.display = 'none';
        document.exitPointerLock();

        // Calculate advanced performance metrics
        const performance = this.calculatePerformanceMetrics();

        // Get best session for comparison
        const bestSession = this.getBestSession();
        console.log('Current score:', this.score);
        console.log('Best session:', bestSession);

        // Show best score section
        const bestScoreSection = document.getElementById('best-score-section');
        const newHighscoreBanner = document.getElementById('new-highscore-banner');
        const currentScoreDisplay = document.getElementById('current-score-display');
        const bestScoreDisplay = document.getElementById('best-score-display');

        console.log('End game - best score elements found:', {
            bestScoreSection: !!bestScoreSection,
            bestScoreDisplay: !!bestScoreDisplay,
            currentScoreDisplay: !!currentScoreDisplay,
            newHighscoreBanner: !!newHighscoreBanner
        });

        if (!bestScoreSection || !bestScoreDisplay || !currentScoreDisplay || !newHighscoreBanner) {
            console.error('Some DOM elements not found for best score display');
            return;
        }

        bestScoreSection.style.display = 'block';
        currentScoreDisplay.textContent = this.score;

        if (bestSession) {
            bestScoreDisplay.textContent = bestSession.score;
            console.log('Comparing current score', this.score, 'to best score', bestSession.score);

            // Check if this is a new highscore
            if (this.score > bestSession.score) {
                newHighscoreBanner.style.display = 'block';
                console.log('NEW HIGHSCORE detected');
            } else {
                newHighscoreBanner.style.display = 'none';
                console.log('Not a new highscore');
            }
        } else {
            // First game ever
            bestScoreDisplay.textContent = this.score;
            newHighscoreBanner.style.display = 'block';
            console.log('First game ever - showing as highscore');
        }

        // Update final stats - basic stats
        const finalScore = document.getElementById('final-score');
        const finalTime = document.getElementById('final-time');
        const finalAccuracy = document.getElementById('final-accuracy');
        const finalHits = document.getElementById('final-hits');
        const finalMisses = document.getElementById('final-misses');

        if (finalScore) finalScore.textContent = this.score;
        if (finalTime) finalTime.textContent = this.elapsedTime.toFixed(2) + 's';
        if (finalAccuracy) finalAccuracy.textContent = this.getAccuracy() + '%';
        if (finalHits) finalHits.textContent = this.hits;
        if (finalMisses) finalMisses.textContent = this.misses;

        // Update legacy stats elements for backward compatibility
        const legacyScore = document.getElementById('final-score-legacy');
        const legacyTime = document.getElementById('final-time-legacy');
        const legacyAccuracy = document.getElementById('final-accuracy-legacy');
        const legacyHits = document.getElementById('final-hits-legacy');
        const legacyMisses = document.getElementById('final-misses-legacy');

        if (legacyScore) legacyScore.textContent = this.score;
        if (legacyTime) legacyTime.textContent = this.elapsedTime.toFixed(2) + 's';
        if (legacyAccuracy) legacyAccuracy.textContent = this.getAccuracy() + '%';
        if (legacyHits) legacyHits.textContent = this.hits;
        if (legacyMisses) legacyMisses.textContent = this.misses;

        // Update advanced stats
        const perfGrade = document.getElementById('performance-grade');
        const avgReaction = document.getElementById('avg-reaction-time');
        const consistency = document.getElementById('consistency-score');
        const totalClicks = document.getElementById('total-clicks');
        const clickEfficiency = document.getElementById('click-efficiency');
        const targetsHitRate = document.getElementById('targets-hit-rate');

        if (perfGrade) perfGrade.textContent = performance.grade;
        if (avgReaction) avgReaction.textContent = performance.averageReactionTime > 0 ? Math.round(performance.averageReactionTime) + 'ms' : 'N/A';
        if (consistency) consistency.textContent = performance.consistency > 0 ? Math.round(performance.consistency) + 'ms' : 'N/A';
        if (totalClicks) totalClicks.textContent = performance.totalClicks;
        if (clickEfficiency) clickEfficiency.textContent = performance.efficiency.toFixed(1) + '%';
        if (targetsHitRate) targetsHitRate.textContent = performance.hitRate.toFixed(1) + '%';

        // Update progress bars
        this.updateProgressBars(performance);

        // Color code the grade
        const gradeElement = document.getElementById('performance-grade');
        if (gradeElement) {
            gradeElement.className = 'performance-grade grade-' + performance.grade.toLowerCase();
        }

        console.log('About to save session data - score:', this.score, 'hits:', this.hits);
        // Save session data to history
        this.saveSessionData();

        // Remove all targets
        this.targets.forEach(target => {
            this.scene.remove(target);
        });
        this.targets = [];
    }

    getTargetShapeAndSize() {
        // Dynamic shape progression based on score - circles to boxes
        if (this.score < 15) {
            // Early game: Circles (spheres)
            return { shape: 'sphere', size: 1.2 };
        } else {
            // Late game: Boxes (cubes)
            return { shape: 'box', size: 1.2 };
        }
    }

    spawnTarget() {

        // Get target shape and size based on current score
        const targetConfig = this.getTargetShapeAndSize();

        // Adjust size for precision mode
        let size = targetConfig.size;
        if (this.gameMode === 'precision') {
            size *= 0.67; // Smaller but still generous for precision mode
        }

        // Create geometry based on shape
        let geometry;
        switch (targetConfig.shape) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(size, 32, 32);
                break;
            case 'box':
                geometry = new THREE.BoxGeometry(size * 1.6, size * 1.6, size * 1.6); // Larger boxes for better visibility
                break;
            default:
                geometry = new THREE.SphereGeometry(size, 32, 32);
        }

        // All targets are light matte blue like in Aimlabs - highly visible
        const material = new THREE.MeshPhongMaterial({
            color: 0x87CEEB, // Light blue color
            shininess: 20, // Matte finish - not too shiny
            emissive: 0x87CEEB,
            emissiveIntensity: 0.25, // Slightly more visible
            transparent: false,
            side: THREE.DoubleSide // Ensure visibility from all angles
        });

        const target = new THREE.Mesh(geometry, material);
        target.castShadow = false; // Potato preset: no shadows
        target.receiveShadow = false; // Potato preset: no shadows
        target.frustumCulled = false; // Prevent targets from being culled when out of view
        target.visible = true; // Ensure target is always visible
        target.matrixAutoUpdate = true; // Ensure matrix updates automatically

        // Position targets with proper spacing to prevent overlap
        const maxX = 5; // Increased area for better target spacing
        const maxY = 4; // Increased area for better target spacing

        // Calculate actual target size including scaling
        const actualTargetSize = targetConfig.shape === 'box' ? size * 1.6 : size;
        const minDistance = actualTargetSize * 3.0; // Minimum distance is 3.0x the target size for better spacing
        
        let attempts = 0;
        let validPosition = false;

        while (!validPosition && attempts < 50) { // Increased attempts for better collision detection
            const newX = (Math.random() - 0.5) * maxX * 2;
            const newY = (Math.random() - 0.5) * maxY * 2;

            // Check collision with all existing targets using proper 3D distance
            validPosition = true;
            for (const existingTarget of this.targets) {
                // Calculate actual size of existing target
                const existingTargetSize = existingTarget.geometry.type === 'BoxGeometry' ? 
                    (existingTarget.geometry.parameters.width * 1.6) : existingTarget.geometry.parameters.radius;
                
                // Calculate minimum required distance (sum of radii + larger buffer for better spacing)
                const requiredDistance = (actualTargetSize + existingTargetSize) / 2 + 1.0;
                
                // Check 3D distance (including Z coordinate)
                const distance = Math.sqrt(
                    Math.pow(newX - existingTarget.position.x, 2) +
                    Math.pow(newY - existingTarget.position.y, 2) +
                    Math.pow(-3 - existingTarget.position.z, 2) // Both targets are at z = -3
                );

                if (distance < requiredDistance) {
                    validPosition = false;
                    break;
                }
            }

            if (validPosition) {
                target.position.x = newX;
                target.position.y = newY;
            }

            attempts++;
        }

        // If we couldn't find a valid position after many attempts, place it in a guaranteed empty area
        if (!validPosition) {
            // Use a much smaller area and try to find the least crowded spot
            const fallbackMaxX = 2;
            const fallbackMaxY = 1.5;
            let bestX = 0, bestY = 0, maxMinDistance = 0;
            
            // Try multiple positions and pick the one with maximum distance to nearest target
            for (let i = 0; i < 20; i++) {
                const testX = (Math.random() - 0.5) * fallbackMaxX * 2;
                const testY = (Math.random() - 0.5) * fallbackMaxY * 2;
                
                let minDistanceToAnyTarget = Infinity;
                for (const existingTarget of this.targets) {
                    const distance = Math.sqrt(
                        Math.pow(testX - existingTarget.position.x, 2) +
                        Math.pow(testY - existingTarget.position.y, 2)
                    );
                    minDistanceToAnyTarget = Math.min(minDistanceToAnyTarget, distance);
                }
                
                if (minDistanceToAnyTarget > maxMinDistance) {
                    maxMinDistance = minDistanceToAnyTarget;
                    bestX = testX;
                    bestY = testY;
                }
            }
            
            target.position.x = bestX;
            target.position.y = bestY;
        }

        target.position.z = -3; // Position targets in front of camera

        // Add spawn time for animation and performance tracking
        target.spawnTime = Date.now();
        this.targetSpawnTimes.push(target.spawnTime);

        // Add target to scene immediately - no spawn animation to prevent visibility issues
        this.scene.add(target);
        this.targets.push(target);

        // Ensure target is fully visible from the start
        target.material.transparent = false;
        target.material.opacity = 1;
        target.scale.setScalar(1.0);

        // Set as current target if none exists
        if (!this.currentTarget) {
            this.currentTarget = target;
            this.highlightTarget(target);
        }
    }

    highlightTarget(target) {
        // Create highlight effect
        const highlight = document.createElement('div');
        highlight.className = 'target-highlight';
        document.body.appendChild(highlight);

        // Position highlight
        this.updateHighlightPosition(highlight, target);

        // Remove highlight after animation
        setTimeout(() => {
            if (highlight.parentNode) {
                highlight.parentNode.removeChild(highlight);
            }
        }, 300);
    }

    updateHighlightPosition(highlight, target) {
        const vector = target.position.clone();
        vector.project(this.camera);

        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

        const width = 1.5 * (window.innerWidth / 16); // Approximate size
        const height = 1.5 * (window.innerHeight / 12);

        highlight.style.left = (x - width/2) + 'px';
        highlight.style.top = (y - height/2) + 'px';
        highlight.style.width = width + 'px';
        highlight.style.height = height + 'px';
    }

    hitTarget(target) {
        // Prevent hitting targets that are already being removed
        if (target.beingRemoved) return;

        target.beingRemoved = true;
        this.hits++;
        this.consecutiveHits++;
        this.score += 1; // 1 point per hit

        // Track performance data
        const currentTime = Date.now();
        const reactionTime = currentTime - target.spawnTime; // Time from spawn to hit
        this.hitTimes.push(reactionTime);
        this.hitTimestamps.push(currentTime);

        // Play hit sound
        this.playHitSound();

        // Always spawn a replacement target immediately when one is hit
        this.spawnTarget();


        // Simple particle effect
        this.createParticles(target.position, 0x87CEEB, 4);

        // Visual feedback - show consecutive hits stack
        this.createHitFeedback(target.position, '+' + this.consecutiveHits);

        // Refined target disappearing animation - dynamic but gentler
                target.material.transparent = true;
        const startTime = Date.now();
        const duration = 180; // Slightly longer for smoother feel

        // Store original color for restoration
        const originalColor = target.material.color.clone();
        const originalEmissive = target.material.emissive.clone();

        const animateRemoval = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Softer bounce scaling effect
            const bounceProgress = 1 - Math.pow(1 - progress, 2.5); // Gentler ease-out
            const scale = 1 + bounceProgress * 0.8 + Math.sin(progress * Math.PI * 2) * 0.05; // Scale up with subtle bounce

            // Smooth fade with gentle curve
            const opacity = Math.pow(1 - progress, 1.5);

            // Subtle color flash effect
            const flashIntensity = Math.max(0, 1 - progress * 3); // Slower, gentler flash
            const flashColor = new THREE.Color().lerpColors(originalColor, new THREE.Color(0.9, 0.95, 1), flashIntensity);

            // Minimal rotation for subtle dynamism
            const rotationSpeed = (1 - progress) * 0.03; // Much slower rotation
            target.rotation.z += rotationSpeed;

            target.scale.setScalar(scale);
            target.material.opacity = opacity;
            target.material.color.copy(flashColor);

            // Soft emissive glow
            target.material.emissive.setRGB(flashIntensity * 0.2, flashIntensity * 0.25, flashIntensity * 0.4);

            if (progress < 1) {
                requestAnimationFrame(animateRemoval);
            } else {
                this.scene.remove(target);
                this.targets.splice(this.targets.indexOf(target), 1);
            }
        };

        animateRemoval();

        this.updateUI();
    }

    missTarget() {
        // In aim training, clicking when no target is under crosshair is a miss
        this.misses++;
        this.consecutiveHits = 0; // Reset consecutive hits on miss

        // Play miss sound
        this.playMissSound();

        // Don't deduct points on miss - only reward hits
        this.updateUI();
    }

    createHitFeedback(position, text) {
        const feedback = document.createElement('div');
        feedback.className = 'hit-feedback';
        feedback.textContent = text;

        // Dynamic color based on consecutive hits streak
        if (text.startsWith('+')) {
            const streak = parseInt(text.substring(1));
            if (streak === 1) {
                feedback.style.color = '#4ecdc4'; // Default teal
            } else if (streak === 2) {
                feedback.style.color = '#00ff88'; // Bright green
            } else if (streak === 3) {
                feedback.style.color = '#ffd700'; // Gold
            } else if (streak === 4) {
                feedback.style.color = '#ff8c00'; // Orange
            } else if (streak === 5) {
                feedback.style.color = '#ff4500'; // Red-orange
            } else {
                feedback.style.color = '#ff1493'; // Hot pink for 6+
            }
        } else {
            feedback.style.color = '#ff6b6b'; // Red for misses
        }

        // Position feedback with some random offset
        const vector = position.clone();
        vector.project(this.camera);

        const baseX = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const baseY = (-vector.y * 0.5 + 0.5) * window.innerHeight;

        // Add some randomness to position
        const offsetX = (Math.random() - 0.5) * 60;
        const offsetY = (Math.random() - 0.5) * 40;

        feedback.style.left = (baseX + offsetX) + 'px';
        feedback.style.top = (baseY + offsetY) + 'px';

        // Enhanced styling
        feedback.style.fontSize = '18px';
        feedback.style.fontWeight = 'bold';
        feedback.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        feedback.style.pointerEvents = 'none';
        feedback.style.zIndex = '1000';

        document.body.appendChild(feedback);

        // Gentle animation with subtle scaling and movement
        let startTime = Date.now();
        const duration = 700; // More reasonable duration
        let currentX = parseFloat(feedback.style.left);
        let currentY = parseFloat(feedback.style.top);

        const animateFeedback = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Subtle scaling effect
            const scaleProgress = 1 - Math.pow(1 - progress, 2);
            const scale = 1 + scaleProgress * 0.3 + Math.sin(progress * Math.PI) * 0.1;

            // Gentle upward movement
            const moveY = progress * -40; // Move up 40px (less dramatic)
            const opacity = 1 - Math.pow(progress, 1.5); // Gentler fade

            // Apply transforms
            feedback.style.transform = `scale(${scale}) translateY(${moveY}px)`;
            feedback.style.opacity = opacity;

            if (progress < 1) {
                requestAnimationFrame(animateFeedback);
            } else {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
            }
        };

        animateFeedback();
    }

    updateUI() {
        document.getElementById('score-display').textContent = `Score: ${this.score}`;
        document.getElementById('accuracy').textContent = `Accuracy: ${this.getAccuracy()}%`;

        if (this.gameState === 'playing') {
            this.elapsedTime = (Date.now() - this.startTime) / 1000;
            document.getElementById('timer').textContent = `Time: ${this.elapsedTime.toFixed(2)}s`;

            // End game after 30 seconds
            if (this.elapsedTime >= 30) {
                this.endGame();
            }
        }
    }



    getAccuracy() {
        const totalAttempts = this.hits + this.misses;
        return totalAttempts > 0 ? Math.round((this.hits / totalAttempts) * 100) : 100;
    }

    calculatePerformanceMetrics() {
        const accuracy = this.getAccuracy();
        const totalAttempts = this.hits + this.misses;

        // Calculate average reaction time
        let avgReactionTime = 0;
        if (this.hitTimes.length > 0) {
            avgReactionTime = this.hitTimes.reduce((sum, time) => sum + time, 0) / this.hitTimes.length;
        }

        // Calculate consistency (lower is better - standard deviation of reaction times)
        let consistency = 0;
        if (this.hitTimes.length > 1) {
            const mean = avgReactionTime;
            const variance = this.hitTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / this.hitTimes.length;
            consistency = Math.sqrt(variance);
        }

        // Calculate performance grade based on accuracy and reaction time
        let grade = 'F';
        if (accuracy >= 95 && avgReactionTime < 300) grade = 'S';
        else if (accuracy >= 90 && avgReactionTime < 400) grade = 'A';
        else if (accuracy >= 80 && avgReactionTime < 500) grade = 'B';
        else if (accuracy >= 70 && avgReactionTime < 600) grade = 'C';
        else if (accuracy >= 60) grade = 'D';

        // Calculate click efficiency (hits per click)
        const efficiency = totalAttempts > 0 ? (this.hits / this.performanceData.totalClicks * 100) : 0;

        this.performanceData = {
            totalClicks: this.performanceData.totalClicks,
            averageReactionTime: avgReactionTime,
            consistency: consistency,
            accuracy: accuracy,
            efficiency: efficiency,
            grade: grade,
            totalTargets: this.targetSpawnTimes.length,
            hitRate: this.hitTimes.length / Math.max(1, this.targetSpawnTimes.length) * 100
        };

        return this.performanceData;
    }

    updateProgressBars(performance) {
        // Progress Bar 1: Accuracy - matches the Accuracy card exactly
        const accuracyBar = document.getElementById('accuracy-progress');
        const accuracyValue = document.getElementById('accuracy-value');
        const accuracyPercent = Math.min(performance.accuracy, 100);
        accuracyBar.style.width = accuracyPercent + '%';
        accuracyValue.textContent = performance.accuracy + '%';

        // Progress Bar 2: Speed Rating - based on reaction time (faster = better)
        const efficiencyBar = document.getElementById('efficiency-progress');
        const efficiencyValue = document.getElementById('efficiency-value');
        // Convert reaction time to a 0-100 score (lower reaction time = higher score)
        const maxReactionTime = 1000; // 1 second = 0% performance
        const minReactionTime = 200;  // 0.2 seconds = 100% performance
        let speedScore = 0;
        if (performance.averageReactionTime > 0) {
            speedScore = Math.max(0, Math.min(100,
                100 - ((performance.averageReactionTime - minReactionTime) / (maxReactionTime - minReactionTime)) * 100
            ));
        }
        efficiencyBar.style.width = speedScore + '%';
        efficiencyValue.textContent = speedScore.toFixed(0) + '%';

        // Progress Bar 3: Consistency Rating - based on reaction time variance (lower variance = better)
        const hitRateBar = document.getElementById('hit-rate-progress');
        const hitRateValue = document.getElementById('hit-rate-value');
        // Convert consistency (standard deviation) to a 0-100 score (lower std dev = higher score)
        const maxConsistency = 300; // High variance = poor consistency
        let consistencyScore = 100;
        if (performance.consistency > 0) {
            consistencyScore = Math.max(0, Math.min(100,
                100 - (performance.consistency / maxConsistency) * 100
            ));
        }
        hitRateBar.style.width = consistencyScore + '%';
        hitRateValue.textContent = consistencyScore.toFixed(0) + '%';

        // Progress Bar 4: Overall Performance - combination of accuracy, speed, and consistency
        const reactionTimeBar = document.getElementById('reaction-time-progress');
        const reactionTimeValue = document.getElementById('reaction-time-value');
        const overallScore = (performance.accuracy + speedScore + consistencyScore) / 3;
        reactionTimeBar.style.width = overallScore + '%';
        reactionTimeValue.textContent = overallScore.toFixed(0) + '%';
    }

    loadSavedSensitivitySettings() {
        const savedSettings = localStorage.getItem('webclicker_sensitivity_settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.mouseSensitivity = settings.mouseSensitivity || 0.002;
                this.currentGameSettings = settings.gameSettings || null;

                // Populate UI with saved settings
                if (settings.gameSettings) {
                    document.getElementById('game-select').value = settings.gameSettings.game;
                    document.getElementById('sens-input').value = settings.gameSettings.sensitivity;
                    document.getElementById('fov-input').value = settings.gameSettings.fov;
                    document.getElementById('separate-axes').checked = settings.gameSettings.separateAxes || false;

                    if (settings.gameSettings.separateAxes) {
                        document.getElementById('separate-axes-container').style.display = 'block';
                        document.getElementById('sens-h-input').value = settings.gameSettings.sensH;
                        document.getElementById('sens-v-input').value = settings.gameSettings.sensV;
                    }
                }
            } catch (e) {
                console.error('Error loading saved sensitivity settings:', e);
                this.mouseSensitivity = 0.002; // fallback
            }
        } else {
            this.mouseSensitivity = 0.002; // default
        }
    }

    testSensitivity() {
        const game = document.getElementById('game-select').value;
        const sensitivity = parseFloat(document.getElementById('sens-input').value);
        const fov = parseFloat(document.getElementById('fov-input').value) || this.gameFOV[game] || 90;
        const separateAxes = document.getElementById('separate-axes').checked;

        if (!sensitivity || sensitivity <= 0) {
            alert('Please enter a valid sensitivity value');
            return;
        }

        let sensH = sensitivity;
        let sensV = sensitivity;

        if (separateAxes) {
            sensH = parseFloat(document.getElementById('sens-h-input').value) || sensitivity;
            sensV = parseFloat(document.getElementById('sens-v-input').value) || sensitivity;

            if (sensH <= 0 || sensV <= 0) {
                alert('Please enter valid horizontal and vertical sensitivity values');
                return;
            }
        }

        // Accurate game-specific sensitivity conversion
        let mouseSensH, mouseSensV;

        // Convert game sensitivity to mouse sensitivity based on game mechanics
        if (game === 'fortnite') {
            // Fortnite: sensitivity values are typically 0.1-1.0, representing degrees per inch
            // These need to be scaled appropriately for our pixel-based system
            mouseSensH = parseFloat(sensH) * 0.0008; // Much higher scaling for Fortnite
            mouseSensV = separateAxes ? parseFloat(sensV) * 0.0008 : mouseSensH;
        } else if (game === 'valorant') {
            // Valorant: 0.01 = 1 degree per 360° turn
            const degreesPer360 = parseFloat(sensH) * 100; // Convert from 0.X to degrees
            const radiansPer360 = (degreesPer360 / 360) * (Math.PI * 2);
            mouseSensH = radiansPer360 * 0.001;
            mouseSensV = separateAxes ? (parseFloat(sensV) * 100 / 360) * (Math.PI * 2) * 0.001 : mouseSensH;
        } else if (game === 'overwatch') {
            // Overwatch: sensitivity values are degrees per 360° turn
            const degreesPer360 = parseFloat(sensH);
            const radiansPer360 = (degreesPer360 / 360) * (Math.PI * 2);
            mouseSensH = radiansPer360 * 0.0008;
            mouseSensV = separateAxes ? (parseFloat(sensV) / 360) * (Math.PI * 2) * 0.0008 : mouseSensH;
        } else {
            // Default/fallback conversion for other games
            mouseSensH = parseFloat(sensH) * 0.001;
            mouseSensV = separateAxes ? parseFloat(sensV) * 0.001 : mouseSensH;
        }

        // Apply to game
        this.mouseSensitivity = mouseSensH;
        this.mouseSensitivityV = mouseSensV;

        // Start test mode (just start the game with the new sensitivity)
        this.startGame();
    }

    saveSensitivity() {
        const game = document.getElementById('game-select').value;
        const sensitivity = parseFloat(document.getElementById('sens-input').value);
        const fov = parseFloat(document.getElementById('fov-input').value) || this.gameFOV[game] || 90;
        const separateAxes = document.getElementById('separate-axes').checked;

        if (!sensitivity || sensitivity <= 0) {
            alert('Please enter a valid sensitivity value');
            return;
        }

        let sensH = sensitivity;
        let sensV = sensitivity;

        if (separateAxes) {
            sensH = parseFloat(document.getElementById('sens-h-input').value) || sensitivity;
            sensV = parseFloat(document.getElementById('sens-v-input').value) || sensitivity;

            if (sensH <= 0 || sensV <= 0) {
                alert('Please enter valid horizontal and vertical sensitivity values');
                return;
            }
        }

        // Calculate and save mouse sensitivity
        let mouseSensH = sensH * 0.002; // Basic conversion factor
        let mouseSensV = separateAxes ? sensV * 0.002 : mouseSensH;

        this.mouseSensitivity = mouseSensH;
        this.mouseSensitivityV = mouseSensV;

        // Save settings to localStorage
        const settings = {
            mouseSensitivity: mouseSensH,
            mouseSensitivityV: mouseSensV,
            gameSettings: {
                game: game,
                sensitivity: sensitivity,
                sensH: sensH,
                sensV: sensV,
                fov: fov,
                separateAxes: separateAxes
            }
        };

        localStorage.setItem('webclicker_sensitivity_settings', JSON.stringify(settings));

        alert(`Sensitivity saved!\nGame: ${game}\nSensitivity: ${sensitivity}${separateAxes ? ` (H: ${sensH}, V: ${sensV})` : ''}\nFOV: ${fov}°`);
    }




    backToMenu() {
        // Hide all screens and show main menu
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('main-menu').style.display = 'block';

        // Show sensitivity converter during gameplay
        document.getElementById('sensitivity-converter').style.display = 'block';
    }

    pauseGame() {
        if (this.gameState !== 'playing') return;

        this.gameState = 'paused';
        this.pauseStartTime = Date.now();

        // Show pause menu
        document.getElementById('pause-menu').style.display = 'block';

        // Unlock pointer so user can click menu buttons
        document.exitPointerLock();
        this.crosshairElement.style.display = 'none';
    }

    resumeGame() {
        if (this.gameState !== 'paused') return;

        this.gameState = 'playing';

        // Adjust start time to account for pause duration
        const pauseDuration = Date.now() - this.pauseStartTime;
        this.startTime += pauseDuration;

        // Hide pause menu
        document.getElementById('pause-menu').style.display = 'none';

        // Lock pointer again for gameplay
        document.body.requestPointerLock();
        this.crosshairElement.style.display = 'block';
    }


    returnToMenu() {
        // Save current session data if there's an active game with progress
        if ((this.gameState === 'playing' || this.gameState === 'paused') && this.hits > 0) {
            console.log('Saving session data before returning to menu. Game state:', this.gameState, 'Hits:', this.hits);
            // Calculate performance metrics for the current session and update performanceData
            this.performanceData = this.calculatePerformanceMetrics();

            // Save the session data
            this.saveSessionData();
        } else {
            console.log('Not saving session data. Game state:', this.gameState, 'Hits:', this.hits);
        }

        // Complete page refresh to reset everything as if user refreshed the site
        window.location.reload();
    }

    // Update history display when returning to menu (in case of page refresh)
    // This method can be called to refresh history display
    refreshHistoryDisplay() {
        setTimeout(() => {
            this.updateHistoryDisplay();
        }, 100);
    }

    applyDifficultySettings() {
        const settings = {
            easy: { lifetime: 3000, spawnDelay: 1500, maxTargets: 2 },
            medium: { lifetime: 2000, spawnDelay: 1000, maxTargets: 3 },
            hard: { lifetime: 1500, spawnDelay: 800, maxTargets: 4 },
            expert: { lifetime: 1000, spawnDelay: 600, maxTargets: 5 }
        };

        const diff = settings[this.difficulty];
        this.targetLifetime = diff.lifetime;
        this.spawnDelay = diff.spawnDelay;
        this.maxTargets = diff.maxTargets;

        // Update UI
        document.getElementById('target-lifetime').value = (diff.lifetime / 1000).toFixed(1);
        document.getElementById('target-lifetime-value').textContent = (diff.lifetime / 1000).toFixed(1) + 's';
        document.getElementById('spawn-delay').value = (diff.spawnDelay / 1000).toFixed(1);
        document.getElementById('spawn-delay-value').textContent = (diff.spawnDelay / 1000).toFixed(1) + 's';
    }

    applyGameModeSettings() {
        // Different game modes can have different rules
        switch (this.gameMode) {
            case 'jumbo-tile-frenzy':
                // Default behavior - targets spawn and must be clicked before they disappear
                break;
            case 'speed-test':
                // Faster spawning, shorter lifetime
                this.targetLifetime = 800;
                this.spawnDelay = 400;
                break;
            case 'precision':
                // Slower spawning, longer lifetime, smaller targets
                this.targetLifetime = 4000;
                this.spawnDelay = 2000;
                break;
        }
    }

    updateSensitivity() {
        // This could be expanded to convert from any game to others
        // For now, it's handled by the convert button
    }

    animate() {
        // Game logic - only run when playing
        if (this.gameState === 'playing') {
            this.updateGame();
            this.updateParticles();
        }

        // Always render for smooth UI transitions
        this.camera.updateMatrixWorld(true); // Ensure camera matrices are current before rendering
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);

        // Continue animation loop
        requestAnimationFrame(() => this.animate());
    }

    updateGame() {
        const currentTime = Date.now();

        // Targets are maintained at exactly 3 by spawning replacements immediately when hit

        // Targets maintain consistent size - no pulsing animation

        this.updateUI();
    }

    updateCrosshairStyle() {
        const crosshair = document.querySelector('.crosshair');
        if (!crosshair) return;

        // Remove all color classes
        crosshair.classList.remove('crosshair-red', 'crosshair-green', 'crosshair-blue',
                                   'crosshair-cyan', 'crosshair-magenta', 'crosshair-yellow');

        // Add the selected color class
        if (this.crosshairStyle !== 'default') {
            crosshair.classList.add(`crosshair-${this.crosshairStyle}`);
        }
    }

    updateCrosshairSize() {
        const crosshair = document.querySelector('.crosshair');
        if (!crosshair) return;

        const size = this.crosshairSize;
        crosshair.style.width = size + 'px';
        crosshair.style.height = size + 'px';

        // Update pseudo-elements positioning
        const halfSize = size / 2;
        const thickness = this.crosshairThickness;
        const offset = halfSize - thickness / 2;

        crosshair.style.setProperty('--crosshair-offset', offset + 'px');
    }

    updateCrosshairThickness() {
        const crosshair = document.querySelector('.crosshair');
        if (!crosshair) return;

        const thickness = this.crosshairThickness;
        crosshair.style.setProperty('--crosshair-thickness', thickness + 'px');
    }

    updateCrosshairDot() {
        const crosshair = document.querySelector('.crosshair');
        if (!crosshair) return;

        if (this.crosshairDot) {
            crosshair.style.background = 'currentColor';
        } else {
            crosshair.style.background = 'none';
        }
    }

    resetCrosshairSettings() {
        this.crosshairStyle = 'default';
        this.crosshairSize = 20;
        this.crosshairThickness = 2;
        this.crosshairDot = false;

        // Update UI
        document.getElementById('crosshair-style').value = this.crosshairStyle;
        document.getElementById('crosshair-size').value = this.crosshairSize;
        document.getElementById('crosshair-size-value').textContent = this.crosshairSize + 'px';
        document.getElementById('crosshair-thickness').value = this.crosshairThickness;
        document.getElementById('crosshair-thickness-value').textContent = this.crosshairThickness + 'px';
        document.getElementById('crosshair-dot').checked = this.crosshairDot;

        // Apply changes
        this.updateCrosshairStyle();
        this.updateCrosshairSize();
        this.updateCrosshairThickness();
        this.updateCrosshairDot();

        this.saveCrosshairSettings();
    }

    saveCrosshairSettings() {
        const settings = {
            style: this.crosshairStyle,
            size: this.crosshairSize,
            thickness: this.crosshairThickness,
            dot: this.crosshairDot
        };
        localStorage.setItem('webclicker_crosshair_settings', JSON.stringify(settings));
    }

    loadCrosshairSettings() {
        const savedSettings = localStorage.getItem('webclicker_crosshair_settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.crosshairStyle = settings.style || 'default';
                this.crosshairSize = settings.size || 20;
                this.crosshairThickness = settings.thickness || 2;
                this.crosshairDot = settings.dot || false;

                // Update UI
                document.getElementById('crosshair-style').value = this.crosshairStyle;
                document.getElementById('crosshair-size').value = this.crosshairSize;
                document.getElementById('crosshair-size-value').textContent = this.crosshairSize + 'px';
                document.getElementById('crosshair-thickness').value = this.crosshairThickness;
                document.getElementById('crosshair-thickness-value').textContent = this.crosshairThickness + 'px';
                document.getElementById('crosshair-dot').checked = this.crosshairDot;

                // Apply settings
                this.updateCrosshairStyle();
                this.updateCrosshairSize();
                this.updateCrosshairThickness();
                this.updateCrosshairDot();
            } catch (e) {
                console.warn('Error loading crosshair settings:', e);
            }
        }
    }

    loadPreset(game) {
        const presets = {
            overwatch: { sensitivity: 5.0, fov: 103, separateAxes: false },
            valorant: { sensitivity: 0.3, fov: 103, separateAxes: false },
            fortnite: { sensitivity: 0.35, fov: 90, separateAxes: false }, // Typical Fortnite sensitivity
            csgo: { sensitivity: 2.0, fov: 90, separateAxes: false }
        };

        const preset = presets[game];
        if (!preset) return;

        // Update form fields
        document.getElementById('game-select').value = game;
        document.getElementById('sens-input').value = preset.sensitivity;
        document.getElementById('fov-input').value = preset.fov;
        document.getElementById('separate-axes').checked = preset.separateAxes;

        // Hide separate axes container if not needed
        document.getElementById('separate-axes-container').style.display = preset.separateAxes ? 'block' : 'none';

        // Clear separate axis inputs if not using them
        if (!preset.separateAxes) {
            document.getElementById('sens-h-input').value = '';
            document.getElementById('sens-v-input').value = '';
        }

        // Visual feedback - briefly highlight the preset button
        const button = document.getElementById(`preset-${game === 'overwatch' ? 'ow' : game}`);
        if (button) {
            button.style.background = 'rgba(0, 212, 255, 0.3)';
            button.style.borderColor = 'rgba(0, 212, 255, 0.5)';
            setTimeout(() => {
                button.style.background = 'rgba(255,255,255,0.05)';
                button.style.borderColor = 'rgba(255,255,255,0.1)';
            }, 300);
        }
    }

    // History management methods
    saveSessionData() {
        try {
            const sessionData = {
                timestamp: Date.now(),
                score: this.score,
                accuracy: this.getAccuracy(),
                hits: this.hits,
                misses: this.misses,
                totalClicks: this.performanceData.totalClicks,
                averageReactionTime: this.performanceData.averageReactionTime,
                consistency: this.performanceData.consistency,
                grade: this.performanceData.grade,
                difficulty: this.difficulty,
                gameMode: this.gameMode,
                fov: this.fov
            };

            console.log('Saving session data:', sessionData);
            console.log('performanceData:', this.performanceData);
            console.log('hitTimes length:', this.hitTimes.length);
            console.log('hitTimes:', this.hitTimes);

            // Load existing history
            const existingHistory = this.loadHistory();
            console.log('Existing history length:', existingHistory.length);

            // Add new session to beginning of array
            existingHistory.unshift(sessionData);

            // Keep only last 50 sessions to prevent storage bloat
            const trimmedHistory = existingHistory.slice(0, 50);

            // Save back to localStorage
            localStorage.setItem('webclicker_game_history', JSON.stringify(trimmedHistory));
            console.log('History saved, new total sessions:', trimmedHistory.length);

        } catch (error) {
            console.warn('Failed to save session data:', error);
        }
    }

    loadHistory() {
        try {
            const historyData = localStorage.getItem('webclicker_game_history');
            console.log('Raw history data from localStorage:', historyData);
            const history = historyData ? JSON.parse(historyData) : [];
            console.log('Parsed history:', history);
            console.log('loadHistory returning', history.length, 'sessions');
            return history;
        } catch (error) {
            console.warn('Failed to load history data:', error);
            console.warn('Raw data that failed to parse:', localStorage.getItem('webclicker_game_history'));
            return [];
        }
    }

    getBestSession() {
        const history = this.loadHistory();
        console.log('getBestSession - history length:', history.length);
        if (history.length === 0) {
            console.log('getBestSession - no history, returning null');
            return null;
        }

        // Find session with highest score
        const best = history.reduce((best, session) => {
            const result = (!best || session.score > best.score) ? session : best;
            console.log('Comparing session score', session.score, 'with best', best ? best.score : 'none', '-> new best:', result.score);
            return result;
        });
        console.log('getBestSession - returning best session with score:', best.score);
        return best;
    }

    getRecentSessions(limit = 10) {
        const history = this.loadHistory();
        return history.slice(0, limit);
    }

    clearHistory() {
        localStorage.removeItem('webclicker_game_history');
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        console.log('updateHistoryDisplay called');
        const history = this.loadHistory();
        console.log('Loaded history:', history);

        const historyCard = document.getElementById('history-card');
        const noHistoryMsg = document.getElementById('no-history-message');
        const historyStats = document.getElementById('history-stats');

        if (history.length === 0) {
            console.log('No history found, showing no history message');
            noHistoryMsg.style.display = 'block';
            historyStats.style.display = 'none';
            return;
        }

        console.log('History found, showing stats for', history.length, 'sessions');
        noHistoryMsg.style.display = 'none';
        historyStats.style.display = 'block';

        // Calculate stats
        const bestSession = this.getBestSession();
        const totalGames = history.length;
        const avgAccuracy = history.reduce((sum, session) => sum + session.accuracy, 0) / history.length;
        const avgReactionTime = history.reduce((sum, session) => sum + session.averageReactionTime, 0) / history.length;

        console.log('Calculated stats:', { bestSession, totalGames, avgAccuracy, avgReactionTime });

        // Update stat cards
        document.getElementById('best-score').textContent = bestSession ? bestSession.score : '0';
        document.getElementById('total-games').textContent = totalGames;
        document.getElementById('avg-accuracy').textContent = avgAccuracy.toFixed(1) + '%';
        document.getElementById('avg-reaction').textContent = avgReactionTime > 0 ? Math.round(avgReactionTime) + 'ms' : 'N/A';

        // Update chart
        this.updatePerformanceChart(history.slice(0, 10)); // Show last 10 sessions
    }

    updatePerformanceChart(sessions) {
        const canvas = document.getElementById('chart-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const chartHeight = canvas.height;
        const chartWidth = canvas.width;

        // Clear canvas
        ctx.clearRect(0, 0, chartWidth, chartHeight);

        if (sessions.length === 0) return;

        // Find max score for scaling
        const maxScore = Math.max(...sessions.map(s => s.score));
        const maxReaction = Math.max(...sessions.map(s => s.averageReactionTime || 0));

        // Chart settings
        const barWidth = chartWidth / sessions.length - 10;
        const maxBarHeight = chartHeight - 60; // Leave space for labels

        sessions.forEach((session, index) => {
            const x = index * (chartWidth / sessions.length) + 5;
            const scoreHeight = (session.score / maxScore) * maxBarHeight;
            const reactionHeight = session.averageReactionTime ? (session.averageReactionTime / maxReaction) * maxBarHeight : 0;

            // Draw score bar (blue)
            ctx.fillStyle = '#4ecdc4';
            ctx.fillRect(x, chartHeight - scoreHeight - 30, barWidth, scoreHeight);

            // Draw reaction time bar (red, smaller)
            if (reactionHeight > 0) {
                ctx.fillStyle = '#ff6b6b';
                ctx.fillRect(x + barWidth * 0.7, chartHeight - reactionHeight - 30, barWidth * 0.3, reactionHeight);
            }

            // Draw score label
            ctx.fillStyle = '#fff';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(session.score.toString(), x + barWidth / 2, chartHeight - scoreHeight - 35);
        });

        // Legend
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(10, 10, 12, 12);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('Score', 28, 20);

        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(80, 10, 12, 12);
        ctx.fillStyle = '#fff';
        ctx.fillText('Reaction Time', 98, 20);
    }

    previewCrosshair() {
        // Show crosshair temporarily in menu for preview
        const crosshair = document.querySelector('.crosshair');
        if (crosshair) {
            crosshair.style.display = 'block';
            setTimeout(() => {
                crosshair.style.display = 'none';
            }, 2000);
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AimlabsGame();
});
