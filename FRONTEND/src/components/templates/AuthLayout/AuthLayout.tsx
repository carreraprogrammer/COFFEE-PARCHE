import type { ReactNode } from 'react';
import { Logo } from '../../atoms/Logo';
import styles from './AuthLayout.module.css';

export const AuthLayout = ({ title, children }: { title: string; children: ReactNode }) => (
  <main className={styles.page}>
    <section className={styles.hero}>
      <span className={styles.eyebrow}>Coffee Parches</span>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>
        Tu espacio para conectar, conversar y crecer junto a quienes comparten tu energía.
      </p>
    </section>
    <section className={styles.panel}>
      <div className={styles.panelGlow} aria-hidden="true" />
      <div className={styles.panelLogoWrapper}>
        <Logo size="lg" />
      </div>
      <div className={styles.panelBody}>{children}</div>
    </section>
  </main>
);
