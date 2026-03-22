import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../templates/AppLayout';
import { EventCard } from '../../molecules/EventCard';
import { EmptyState } from '../../molecules/EmptyState';
import { ErrorState } from '../../molecules/ErrorState';
import { Spinner } from '../../atoms/Spinner';
import { eventService } from '../../../services/eventService';
import { EVENT_TYPE_LABELS, type CoffeeEvent, type EventType } from '../../../types/event.types';
import styles from './EventsPage.module.css';

export const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<CoffeeEvent[]>([]);
  const [filter, setFilter] = useState<EventType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setEvents(await eventService.getAll(filter === 'all' ? undefined : { type: filter }));
    } catch {
      setError('No se pudieron cargar los eventos.');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => { void load(); }, [filter]);
  const filters = useMemo(() => ['all', ...Object.keys(EVENT_TYPE_LABELS)] as Array<EventType | 'all'>, []);
  if (isLoading) return <AppLayout title='Parches'><Spinner /></AppLayout>;
  if (error) return <AppLayout title='Parches'><ErrorState message={error} onRetry={() => void load()} /></AppLayout>;
  return <AppLayout title='¿Listo para tu próximo parche? ☕'><div className={styles.filters}>{filters.map((item)=><button key={item} type='button' className={[styles.filter, filter===item ? styles.active : ''].join(' ')} onClick={()=>setFilter(item)}>{item==='all' ? 'Todos' : EVENT_TYPE_LABELS[item]}</button>)}</div>{events.length===0 ? <EmptyState message='No hay parches disponibles por ahora. ¡Vuelve pronto! ☕' /> : <div className={styles.grid}>{events.map((event)=><EventCard key={event.id} event={event} onClick={()=>navigate(`/events/${event.id}`)} />)}</div>}</AppLayout>;
};
