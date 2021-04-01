import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.containerHeader}>
      <div className={styles.headerContent}>
        <img src="/Logo.svg" alt="logo"/>
      </div>
    </header>
  )
}
