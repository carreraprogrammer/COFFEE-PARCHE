import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../atoms/Button';
import { ImageInput } from '../../atoms/ImageInput';
import { PhoneInput } from '../../atoms/PhoneInput';
import { SelectInput } from '../../atoms/SelectInput';
import { useProfileStore } from '../../../store/profileStore';
import { BOGOTA_NEIGHBORHOODS, ENGLISH_LEVEL_LABELS, INTEREST_LABELS, type EnglishLevel, type Interest } from '../../../types/profile.types';
import styles from './OnboardingPage.module.css';

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const completeOnboarding = useProfileStore((state) => state.completeOnboarding);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [englishLevel, setEnglishLevel] = useState<EnglishLevel | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const levelOptions = useMemo(() => Object.entries(ENGLISH_LEVEL_LABELS) as Array<[EnglishLevel, string]>, []);
  const interestOptions = useMemo(() => Object.entries(INTEREST_LABELS) as Array<[Interest, string]>, []);
  const canContinue = step === 1 || (step === 2 ? Boolean(phone && neighborhood) : step === 3 ? Boolean(englishLevel) : interests.length > 0);
  return <div className={styles.page}><div className={styles.progressBar}>{[1,2,3,4].map((item)=><span key={item} className={[styles.segment, item <= step ? styles.active : ''].join(' ')} />)}</div><section className={styles.card}>{step===1 ? <><h1 className={styles.title}>Cuéntanos quién eres ☕</h1><p className={styles.subtitle}>Una foto tuya para que la comunidad te reconozca</p><ImageInput name='avatar' label='Tu foto' value={avatarPreview} onChange={(file, previewUrl)=>{ setAvatarFile(file); setAvatarPreview(previewUrl); }} aspectRatio='1:1' /></> : null}{step===2 ? <><h1 className={styles.title}>Contacto y ubicación</h1><p className={styles.subtitle}>Tu teléfono es para coordinar la llegada al parche 🗺️</p><PhoneInput name='phone' label='Teléfono' value={phone} onChange={(value)=>setPhone(value)} country='CO' /><SelectInput name='neighborhood' label='¿De qué barrio eres?' value={neighborhood} onChange={(value)=>setNeighborhood(String(value))} options={BOGOTA_NEIGHBORHOODS.map((item)=>({ label:item, value:item }))} /></> : null}{step===3 ? <><h1 className={styles.title}>¿Cómo está tu inglés?</h1><p className={styles.subtitle}>Sé honesto, aquí no hay juicio 😄</p><div className={styles.levelGrid}>{levelOptions.map(([value,label])=><button key={value} type='button' className={[styles.optionCard, englishLevel===value ? styles.optionCardActive : ''].join(' ')} onClick={()=>setEnglishLevel(value)}>{label}</button>)}</div></> : null}{step===4 ? <><h1 className={styles.title}>¿Qué tipo de parches te gustan?</h1><div className={styles.interestGrid}>{interestOptions.map(([value,label])=>{ const active = interests.includes(value); return <button key={value} type='button' className={[styles.optionCard, active ? styles.optionCardActive : ''].join(' ')} onClick={()=>setInterests((current)=>active ? current.filter((item)=>item!==value) : [...current, value])}>{label}</button>; })}</div></> : null}<div className={styles.actions}>{step>1 ? <Button label='Atrás' variant='ghost' onClick={()=>setStep((step-1) as 1|2|3|4)} /> : <span />}{step<4 ? <Button label='Continuar' disabled={!canContinue} onClick={()=>setStep((step+1) as 1|2|3|4)} /> : <Button label='¡Listo, empecemos! ☕' disabled={!canContinue} fullWidth onClick={async ()=>{ if (!englishLevel) return; await completeOnboarding({ phone, neighborhood, englishLevel, interests, avatar: avatarFile ?? undefined }); navigate('/events', { replace:true }); }} />}</div></section></div>;
};
