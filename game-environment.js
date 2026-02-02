(() => {
    const environment = {
        createBackgroundTexture() {
            const size = 256;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, size);
            gradient.addColorStop(0, '#0b0f1a');
            gradient.addColorStop(0.6, '#111826');
            gradient.addColorStop(1, '#0a0a0f');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);

            const texture = new THREE.CanvasTexture(canvas);
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearFilter;
            return texture;
        },
        setupEnvironment(game) {
            game.environmentGroup = new THREE.Group();

            // Optimized grid - reduced density from 40x40 to 30x30
            const grid = new THREE.GridHelper(40, 30, 0x1d3a4a, 0x0b1f2c);
            grid.material.opacity = 0.3; // Slightly more visible
            grid.material.transparent = true;
            grid.position.y = -4;
            grid.position.z = -10;
            game.environmentGroup.add(grid);

            const wallGeometry = new THREE.PlaneGeometry(60, 30);
            const wallMaterial = new THREE.MeshBasicMaterial({
                color: 0x0f2230,
                transparent: true,
                opacity: 0.15,
                side: THREE.DoubleSide
            });
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.z = -25;
            game.environmentGroup.add(wall);

            // Reduced star count from 500 to 300 for better performance
            const starCount = 300;
            const starGeometry = new THREE.BufferGeometry();
            const starPositions = new Float32Array(starCount * 3);
            for (let i = 0; i < starCount; i++) {
                const i3 = i * 3;
                starPositions[i3] = (Math.random() - 0.5) * 80;
                starPositions[i3 + 1] = (Math.random() - 0.5) * 40;
                starPositions[i3 + 2] = -Math.random() * 60 - 5;
            }
            starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
            const starMaterial = new THREE.PointsMaterial({
                color: 0x3a6d87,
                size: 0.08,
                transparent: true,
                opacity: 0.6
            });
            const stars = new THREE.Points(starGeometry, starMaterial);
            game.environmentGroup.add(stars);

            game.scene.add(game.environmentGroup);
        }
    };

    window.WebClickerEnvironment = environment;
})();
