import type { CSSProperties } from 'react';
import { Badge } from '../../atoms/Badge';
import type { CoffeeEvent } from '../../../types/event.types';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '../../../types/event.types';
import styles from './EventCard.module.css';

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

export interface EventCardProps {
  event: CoffeeEvent;
  onClick: () => void;
}

export const EventCard = ({ event, onClick }: EventCardProps) => {
  const capacityPercent = Math.min(100, Math.round((event.confirmedCount / Math.max(event.capacity, 1)) * 100));
  return (
    <button className={styles.card} onClick={onClick} type='button'>
      <div className={styles.cover}>
        {event.coverImageUrl ? (
          <img alt={event.title} className={styles.coverImage} src={event.coverImageUrl} />
        ) : (
          <div className={styles.coverFallback} style={{ '--event-gradient': EVENT_TYPE_COLORS[event.eventType] } as CSSProperties}>
            {EVENT_TYPE_LABELS[event.eventType]}
          </div>
        )}
        {event.status === 'completed' ? <div className={styles.overlay}>Evento finalizado</div> : null}
      </div>
      <div className={styles.content}>
        <div className={styles.badges}>
          <Badge label={EVENT_TYPE_LABELS[event.eventType]} variant='brand' />
          <Badge label={event.status} variant={event.isFull ? 'warning' : 'neutral'} />
        </div>
        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.meta}>📅 {dateFormatter.format(new Date(event.startsAt))}</p>
        <p className={styles.meta}>📍 {event.neighborhood}, Bogotá</p>
        {event.partnerName ? <p className={styles.meta}>🤝 {event.partnerName}</p> : null}
        {event.isFull ? (
          <p className={styles.waitlist}>🕐 Lista de espera</p>
        ) : (
          <>
            <div className={styles.capacityBar}>
              <div className={styles.capacityFill} style={{ width: `${capacityPercent}%` }} />
            </div>
            <p className={styles.meta}>{event.confirmedCount} de {event.capacity} cupos</p>
          </>
        )}
        {(event.tipMin || event.tipMax) ? (
          <p className={styles.meta}>Propina: ${event.tipMin?.toLocaleString('es-CO') ?? 0} - ${event.tipMax?.toLocaleString('es-CO') ?? 0}</p>
        ) : null}
      </div>
    </button>
  );
};
