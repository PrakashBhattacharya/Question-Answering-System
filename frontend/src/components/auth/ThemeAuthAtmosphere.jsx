import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import styles from './ThemeAuthAtmosphere.module.css'

/**
 * ThemeAuthAtmosphere
 * Renders distinct, context-matching background atmospheres and animations
 * for the 5 ContextIQ visual design systems on Login & Signup pages.
 *
 * - Original: Neon dual laser beam, breathing cyan-indigo ambient halo, neural matrix circuit
 * - Void: Razor-sharp laser scanline, monochromatic indigo research nodes, coordinate crosshairs on #000
 * - Cloud: Buoyant floating blue data orbs, architectural enterprise blueprint grid, calm ripples
 * - Ember: Rising glowing amber fireplace embers/sparks, warm radial hearth glow, golden motes
 * - Pixelcraft: 3D floating isometric voxel cubes, stepped pixel scanner, retro green block grid
 */
export default function ThemeAuthAtmosphere({ overrideTheme, variant = 'fullscreen' }) {
  const { theme: currentTheme } = useTheme()
  const activeTheme = overrideTheme || currentTheme || 'original'
  const variantClass = variant === 'section' ? styles.sectionAtmosphere : styles.fullscreenAtmosphere

  switch (activeTheme) {
    case 'void':
      return (
        <div className={`${styles.voidAtmosphere} ${variantClass}`} aria-hidden="true">
          <div className={styles.voidScanline} />
          <div className={styles.voidGrid} />
          <div className={styles.voidCenterLine} />
          {/* Minimalist Coordinate Crosshairs */}
          <div className={`${styles.crosshair} ${styles.ch1}`}>+ [0x01_VOID]</div>
          <div className={`${styles.crosshair} ${styles.ch2}`}>+ [110M_BERT]</div>
          <div className={`${styles.crosshair} ${styles.ch3}`}>+ [ZERO_HAL]</div>
          <div className={`${styles.crosshair} ${styles.ch4}`}>+ [25MS_JIT]</div>
          {/* Monochromatic research particles */}
          <div className={styles.voidParticles}>
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className={styles.voidParticle}
                style={{
                  left: `${(i * 8.3 + 4) % 100}%`,
                  animationDelay: `${(i * 0.7) % 5}s`,
                  animationDuration: `${6 + (i % 4) * 2}s`,
                  opacity: 0.2 + (i % 5) * 0.12,
                }}
              />
            ))}
          </div>
        </div>
      )

    case 'cloud':
      return (
        <div className={`${styles.cloudAtmosphere} ${variantClass}`} aria-hidden="true">
          <div className={styles.cloudBlueprintGrid} />
          {/* Buoyant Floating Enterprise Orbs */}
          <div className={`${styles.cloudOrb} ${styles.cloudOrb1}`} />
          <div className={`${styles.cloudOrb} ${styles.cloudOrb2}`} />
          <div className={`${styles.cloudOrb} ${styles.cloudOrb3}`} />
          {/* Calm Thought Ripples */}
          <div className={styles.rippleContainer}>
            <div className={`${styles.cloudRipple} ${styles.ripple1}`} />
            <div className={`${styles.cloudRipple} ${styles.ripple2}`} />
            <div className={`${styles.cloudRipple} ${styles.ripple3}`} />
          </div>
          {/* Crisp sky-blue data dots */}
          <div className={styles.cloudDots}>
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className={styles.cloudDot}
                style={{
                  left: `${(i * 10 + 5) % 95}%`,
                  bottom: `${(i * 9 + 10) % 80}%`,
                  animationDelay: `${(i * 1.1) % 6}s`,
                  animationDuration: `${7 + (i % 3) * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )

    case 'ember':
      return (
        <div className={`${styles.emberAtmosphere} ${variantClass}`} aria-hidden="true">
          <div className={styles.emberHearthGlow} />
          <div className={styles.emberRadialWarmth} />
          <div className={styles.emberParchmentGrid} />
          {/* Rising Glowing Warm Sparks / Embers */}
          <div className={styles.emberSparks}>
            {[...Array(18)].map((_, i) => (
              <span
                key={i}
                className={styles.emberSpark}
                style={{
                  left: `${(i * 5.5 + 3) % 96}%`,
                  width: `${3 + (i % 3) * 2}px`,
                  height: `${3 + (i % 3) * 2}px`,
                  animationDelay: `${(i * 0.45) % 7}s`,
                  animationDuration: `${5 + (i % 5) * 1.5}s`,
                  '--wobble-x': `${(i % 2 === 0 ? 1 : -1) * (18 + (i % 4) * 12)}px`,
                }}
              />
            ))}
          </div>
          {/* Editorial golden dust motes */}
          <div className={styles.emberDustField}>
            {[...Array(8)].map((_, i) => (
              <span
                key={i}
                className={styles.emberDust}
                style={{
                  left: `${(i * 12 + 8) % 92}%`,
                  top: `${(i * 11 + 15) % 75}%`,
                  animationDelay: `${(i * 0.9) % 4}s`,
                }}
              />
            ))}
          </div>
        </div>
      )

    case 'pixelcraft':
      return (
        <div className={`${styles.pixelAtmosphere} ${variantClass}`} aria-hidden="true">
          <div className={styles.pixelCheckerGrid} />
          <div className={styles.pixelScanline} />
          {/* Floating 3D Isometric Voxel Cubes */}
          <div className={styles.voxelContainer}>
            <div className={`${styles.voxelCube} ${styles.voxelGrass}`} style={{ top: '18%', left: '12%', animationDelay: '0s' }}>
              <div className={`${styles.voxelFace} ${styles.faceTop}`} />
              <div className={`${styles.voxelFace} ${styles.faceLeft}`} />
              <div className={`${styles.voxelFace} ${styles.faceRight}`} />
            </div>
            <div className={`${styles.voxelCube} ${styles.voxelGold}`} style={{ top: '25%', right: '14%', animationDelay: '1.2s' }}>
              <div className={`${styles.voxelFace} ${styles.faceTop}`} />
              <div className={`${styles.voxelFace} ${styles.faceLeft}`} />
              <div className={`${styles.voxelFace} ${styles.faceRight}`} />
            </div>
            <div className={`${styles.voxelCube} ${styles.voxelObsidian}`} style={{ bottom: '22%', left: '16%', animationDelay: '2.5s' }}>
              <div className={`${styles.voxelFace} ${styles.faceTop}`} />
              <div className={`${styles.voxelFace} ${styles.faceLeft}`} />
              <div className={`${styles.voxelFace} ${styles.faceRight}`} />
            </div>
            <div className={`${styles.voxelCube} ${styles.voxelDiamond}`} style={{ bottom: '28%', right: '18%', animationDelay: '1.8s' }}>
              <div className={`${styles.voxelFace} ${styles.faceTop}`} />
              <div className={`${styles.voxelFace} ${styles.faceLeft}`} />
              <div className={`${styles.voxelFace} ${styles.faceRight}`} />
            </div>
          </div>
          {/* Stepped 8-bit particle motes */}
          <div className={styles.pixelMotes}>
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className={styles.pixelMote}
                style={{
                  left: `${(i * 8 + 6) % 94}%`,
                  top: `${(i * 7 + 10) % 85}%`,
                  animationDelay: `${(i * 0.5) % 3}s`,
                }}
              />
            ))}
          </div>
        </div>
      )

    case 'imperium':
      return (
        <div className={`${styles.imperiumAtmosphere} ${variantClass}`} aria-hidden="true">
          <div className={styles.imperiumPillar} />
          <div className={styles.imperiumHalo} />
          <div className={styles.imperiumLatticeGrid} />
          <div className={styles.imperiumHorizonLine} />
          {/* Subtle Royal Crest Watermark in deep background */}
          <div className={styles.imperiumWatermark}>⚜</div>
          {/* Imperial Coordinate Seals */}
          <div className={`${styles.crosshair} ${styles.impCh1}`}>⚜ [0x06_IMPERIUM]</div>
          <div className={`${styles.crosshair} ${styles.impCh2}`}>⚜ [110M_BERT_ROYAL]</div>
          <div className={`${styles.crosshair} ${styles.impCh3}`}>⚜ [ZERO_HAL]</div>
          <div className={`${styles.crosshair} ${styles.impCh4}`}>⚜ [SUB_25MS]</div>
          {/* Floating Celestial Golden Sparks */}
          <div className={styles.imperiumSparks}>
            {[...Array(16)].map((_, i) => (
              <span
                key={i}
                className={styles.imperiumSpark}
                style={{
                  left: `${(i * 6.3 + 3) % 96}%`,
                  width: `${3 + (i % 3) * 2}px`,
                  height: `${3 + (i % 3) * 2}px`,
                  animationDelay: `${(i * 0.42) % 6}s`,
                  animationDuration: `${5.5 + (i % 4) * 1.5}s`,
                  '--wobble-x': `${(i % 2 === 0 ? 1 : -1) * (14 + (i % 3) * 10)}px`,
                }}
              />
            ))}
          </div>
        </div>
      )

    case 'original':
    default:
      return (
        <div className={`${styles.originalAtmosphere} ${variantClass}`} aria-hidden="true">
          <div className={styles.originalBeam} />
          <div className={styles.originalHalo} />
          <div className={styles.originalMatrixGrid} />
          <div className={styles.originalHorizonLine} />
          {/* Synaptic cybernetic nodes */}
          <div className={styles.originalNodes}>
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className={styles.originalNode}
                style={{
                  left: `${(i * 9.5 + 4) % 92}%`,
                  top: `${(i * 8.5 + 12) % 78}%`,
                  animationDelay: `${(i * 0.6) % 4}s`,
                }}
              />
            ))}
          </div>
        </div>
      )
  }
}
