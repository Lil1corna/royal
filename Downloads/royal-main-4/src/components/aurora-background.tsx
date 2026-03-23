'use client'

import styles from './aurora-background.module.css'

export default function AuroraBackground() {
  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />
      <div className={styles.blob4} />
      <div className={styles.blob5} />
      <div className={styles.grain} />
      <div className={styles.scanlines} />
      <div className={styles.vignette} />
    </div>
  )
}

