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
            <NavLink to="/dashboard" className={getNavClassName}>
              Dashboard
            </NavLink>
            <NavLink to="/profile" className={getNavClassName}>
              Mi perfil
            </NavLink>
            <PermissionGate permission="users:read">
              <NavLink to="/admin/users" className={getNavClassName}>
                Usuarios
              </NavLink>
            </PermissionGate>
            <PermissionGate permission="roles:read">
              <NavLink to="/admin/roles" className={getNavClassName}>
                Roles
              </NavLink>
            </PermissionGate>
            <PermissionGate permission="forms:read">
              <NavLink to="/admin/forms" className={getNavClassName}>
                Formularios
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
