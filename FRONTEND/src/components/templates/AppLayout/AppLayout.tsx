import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Header } from '../../organisms/Header';
import { PermissionGate } from '../../atoms/PermissionGate';
import styles from './AppLayout.module.css';

const getNavClassName = ({ isActive }: { isActive: boolean }) => [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ');

export const AppLayout = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className={styles.shell}>
    <div className={styles.backdrop} aria-hidden="true" />
    <Header />
    <div className={styles.grid}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarPanel}>
          <p className={styles.sidebarLabel}>Navegacion</p>
          <nav className={styles.nav}>
            <NavLink to="/events" className={getNavClassName}>
              ☕ Parches
            </NavLink>
            <NavLink to="/my-events" className={getNavClassName}>
              📋 Mis parches
            </NavLink>
            <NavLink to="/profile" className={getNavClassName}>
              Mi perfil
            </NavLink>
            <PermissionGate permission="events:create">
              <NavLink to="/admin/events" className={getNavClassName}>
                🎉 Gestionar eventos
              </NavLink>
            </PermissionGate>
            <PermissionGate permission="enrollments:verify">
              <NavLink to="/admin/enrollments" className={getNavClassName}>
                ✅ Inscripciones
              </NavLink>
            </PermissionGate>
            <PermissionGate permission="partners:read">
              <NavLink to="/admin/partners" className={getNavClassName}>
                🤝 Aliados
              </NavLink>
            </PermissionGate>
          </nav>
        </div>
      </aside>
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <span className={styles.pageEyebrow}>Control Center</span>
          <h1 className={styles.title}>{title}</h1>
        </div>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  </div>
);
