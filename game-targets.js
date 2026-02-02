(() => {
    const targets = {
        getTargetShapeAndSize(game) {
            if (game.score < 15) {
                return { shape: 'sphere', size: 1.2 };
            }
            return { shape: 'box', size: 1.2 };
        },
        spawnTarget(game) {
            const targetConfig = this.getTargetShapeAndSize(game);
            let size = targetConfig.size * game.targetSizeScale;
            if (game.gameMode === 'precision') {
                size *= 0.67;
            }

            // Use shared geometry for better performance
            let geometry;
            switch (targetConfig.shape) {
                case 'sphere':
                    geometry = game.sharedGeometries.sphere;
                    break;
                case 'box':
                    geometry = game.sharedGeometries.box;
                    size *= 1.6; // Boxes are slightly larger
                    break;
                default:
                    geometry = game.sharedGeometries.sphere;
            }

            // Clone shared material so we can animate emissive independently
            const material = game.sharedMaterials.target.clone();

            const target = new THREE.Mesh(geometry, material);
            target.castShadow = false;
            target.receiveShadow = false;
            target.frustumCulled = false;
            target.visible = true;
            target.matrixAutoUpdate = true;

            const maxX = 5;
            const maxY = 4;
            const actualTargetSize = targetConfig.shape === 'box' ? size * 1.6 : size;
            const minDistance = actualTargetSize * 3.0;

            let attempts = 0;
            let validPosition = false;
            const newZ = -game.targetDistance;

            while (!validPosition && attempts < 50) {
                const newX = (Math.random() - 0.5) * maxX * 2;
                const newY = (Math.random() - 0.5) * maxY * 2;

                validPosition = true;
                for (const existingTarget of game.targets) {
                    const existingTargetSize = existingTarget.geometry.type === 'BoxGeometry' ?
                        (existingTarget.geometry.parameters.width * 1.6) : existingTarget.geometry.parameters.radius;
                    const requiredDistance = (actualTargetSize + existingTargetSize) / 2 + 1.0;
                    const distance = Math.sqrt(
                        Math.pow(newX - existingTarget.position.x, 2) +
                        Math.pow(newY - existingTarget.position.y, 2) +
                        Math.pow(newZ - existingTarget.position.z, 2)
                    );

                    if (distance < requiredDistance || distance < minDistance) {
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

            if (!validPosition) {
                const fallbackMaxX = 2;
                const fallbackMaxY = 1.5;
                let bestX = 0, bestY = 0, maxMinDistance = 0;

                for (let i = 0; i < 20; i++) {
                    const testX = (Math.random() - 0.5) * fallbackMaxX * 2;
                    const testY = (Math.random() - 0.5) * fallbackMaxY * 2;

                    let minDistanceToAnyTarget = Infinity;
                    for (const existingTarget of game.targets) {
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

            target.position.z = newZ;

            target.spawnTime = Date.now();
            game.targetSpawnTimes.push(target.spawnTime);

            game.scene.add(target);
            game.targets.push(target);

            target.material.transparent = false;
            target.material.opacity = 1;
            target.scale.setScalar(1.0);

            if (!game.currentTarget) {
                game.currentTarget = target;
                this.highlightTarget(game, target);
            }
        },
        highlightTarget(game, target) {
            const highlight = document.createElement('div');
            highlight.className = 'target-highlight';
            document.body.appendChild(highlight);

            this.updateHighlightPosition(game, highlight, target);

            setTimeout(() => {
                if (highlight.parentNode) {
                    highlight.parentNode.removeChild(highlight);
                }
            }, 300);
        },
        updateHighlightPosition(game, highlight, target) {
            const vector = target.position.clone();
            vector.project(game.camera);

            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

            const width = 1.5 * (window.innerWidth / 16);
            const height = 1.5 * (window.innerHeight / 12);

            highlight.style.left = (x - width / 2) + 'px';
            highlight.style.top = (y - height / 2) + 'px';
            highlight.style.width = width + 'px';
            highlight.style.height = height + 'px';
        }
    };

    window.WebClickerTargets = targets;
})();
