import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EventCard } from './EventCard';

const event = {
  id: '1', title: 'Coffee Meetup', description: null, eventType: 'cafe' as const, status: 'published' as const, partnerId: null, partnerName: 'Café Quindío', address: 'Cra 1', neighborhood: 'Chapinero', startsAt: '2026-03-21T18:00:00.000Z', endsAt: null, capacity: 12, confirmedCount: 8, waitlistCount: 0, availableSlots: 4, isFull: false, tipMin: 5000, tipMax: 10000, whatsappInviteLink: null, coverImageUrl: null, galleryUrls: []
};

describe('EventCard', () => {
  it('renders event details', () => {
    render(<EventCard event={event} onClick={vi.fn()} />);
    expect(screen.getByText('Coffee Meetup')).toBeInTheDocument();
    expect(screen.getByText(/Café Quindío/)).toBeInTheDocument();
  });
});
